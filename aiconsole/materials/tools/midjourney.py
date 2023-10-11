import logging
import math
import os
import re
import time
from enum import Enum
from io import BytesIO
from typing import List, Literal

import requests
from PIL import Image
from pydantic import BaseModel
from selenium import webdriver
from selenium.common.exceptions import (NoSuchElementException,
                                        StaleElementReferenceException,
                                        TimeoutException)
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from aiconsole.materials.tools.credentials import load_credential
from aiconsole.settings import settings

_log = logging.getLogger(__name__)
_log.setLevel(settings.LOG_LEVEL)


class MidJourneyImageType(str, Enum):
    MIDJOURNEY_UPSCALE = "MIDJOURNEY_UPSCALE"
    MIDJOURNEY_GRID = "MIDJOURNEY_GRID"


MidJourneyImageTypeLiteral = Literal[
    MidJourneyImageType.MIDJOURNEY_UPSCALE,
    MidJourneyImageType.MIDJOURNEY_GRID,
]


class DiscordMessage(BaseModel):
    id: str
    content: str
    images: list[str]


class MidJourneyAPI:
    driver: webdriver.Chrome | None = None
    webdriver_service: Service | None = None

    def __init__(self):
        self.email = load_credential("midjourney-discord", "email")
        self.password = load_credential("midjourney-discord", "password")
        self.server_id = load_credential("midjourney-discord", "server_id")
        self.channel_id = load_credential("midjourney-discord", "channel_id")

        self.art_channel_url = (
            f"https://discord.com/channels/{self.server_id}/{self.channel_id}"
        )
        self.initialize_webdriver()

    def extract_messages(self) -> List[DiscordMessage]:
        if not self.driver:
            raise ValueError("WebDriver not initialized")

        # Locate all messages
        messages = self.driver.find_elements(
            By.CSS_SELECTOR, 'li[class*="messageListItem-"]'
        )

        extracted_messages = []
        for message in messages:
            # Extract ID
            # extract last segment from
            # data-list-item-id="chat-messages___chat-messages-1142869065577283806-1153420952768626838"
            try:
                message_id = message.get_attribute("id")
            except (
                AttributeError,
                StaleElementReferenceException,
                NoSuchElementException,
            ):
                continue

            if message_id is None:
                continue

            # Extract text content
            text_content = ""
            content_div = message.find_element(
                By.CSS_SELECTOR, "div.markup-eYLPri.messageContent-2t3eCI"
            )
            if content_div:
                text_content = content_div.text

            # Extract image if present
            image_url = self._get_image_url(message)
            if not image_url:
                continue

            extracted_messages.append(
                DiscordMessage(id=message_id, content=text_content, images=[image_url])
            )

        # Print the extracted messages
        return extracted_messages

    @staticmethod
    def _get_image_url(message: WebElement) -> str:
        # Extract image if present
        image_url = ""
        image_element = message.find_elements(By.CSS_SELECTOR, "img.lazyImg-ewiNCh")
        if image_element:
            image_url = image_element[0].get_attribute("src")

        if not image_url:
            image_element = message.find_elements(
                By.CSS_SELECTOR, "a[class*='originalLink-']"
            )
            if image_element:
                image_url = image_element[0].get_attribute("href")

        return image_url

    def initialize_webdriver(self) -> None:
        # Setup WebDriverManager
        self.webdriver_service = Service(ChromeDriverManager().install())

        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument(
            f'--user-data-dir={os.path.join(settings.CREDENTIALS_DIRECTORY, "selenium")}'
        )
        chrome_options.add_argument("--headless")

        # Create a new instance of the Google Chrome driver
        self.driver = webdriver.Chrome(
            options=chrome_options, service=self.webdriver_service
        )

        while True:
            # if we have channelTextArea- element then we are already logged in on the right channel
            if self.driver.find_elements(
                By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'
            ):
                break

            # Navigate to the art channel
            self.driver.get(self.art_channel_url)

            # Ensure the page is fully loaded
            try:
                WebDriverWait(self.driver, settings.MIDJOURNEY_TIMEOUT).until(
                    lambda driver: driver.find_elements(
                        By.CSS_SELECTOR, 'input[name="email"]'
                    )
                    or driver.find_elements(
                        By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'
                    )
                )
            except TimeoutException:
                continue
            # if we have channelTextArea- element then we are already logged in on the right channel
            if self.driver.find_elements(
                By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'
            ):
                break

            # Input Credentials and submit
            self._submit_credentials()

    def _submit_credentials(self) -> None:
        email_input = self.driver.find_element(By.NAME, "email")
        email_input.send_keys(self.email)
        password_input = self.driver.find_element(By.NAME, "password")
        password_input.send_keys(self.password)
        password_input.submit()

    def create_image(self, prompt: str) -> list[str]:
        if not self.driver:
            raise ValueError("WebDriver not initialized")

        image_paths = []
        try:
            # Find the message input box and type your message
            WebDriverWait(self.driver, settings.MIDJOURNEY_TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, 'div[class*="channelTextArea-"]')
                )
            )

            # Focus on the body of the website
            self.driver.find_element(
                By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'
            ).click()

            self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.TAB)

            # Save current message ids
            messages = self.extract_messages()
            old_message_ids = [msg.id for msg in messages]

            time.sleep(1)  # Wait for Discord to load the channel
            # Send keys to focused element
            self.driver.switch_to.active_element.send_keys("/imagine")
            WebDriverWait(self.driver, settings.MIDJOURNEY_TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, 'div[class*="autocompleteRowHeading-"]')
                )
            )
            self.driver.switch_to.active_element.send_keys(Keys.RETURN)

            # Replace 'your_message' with the message you want to send
            self.driver.switch_to.active_element.send_keys(prompt)
            self.driver.switch_to.active_element.send_keys(Keys.RETURN)

            _log.info("Prompt sent, monitoring for results ...")
            image_paths = self._wait_for_image(old_message_ids, prompt)
        finally:
            self.driver.quit()
            return image_paths

    def _wait_for_image(self, old_message_ids: list[str], prompt: str) -> list[str]:
        while True:
            messages = self.extract_messages()

            for message in messages:
                if (
                    self.match_mid_journey_prompt_ignoring_urls(prompt, message.content)
                    and message.id not in old_message_ids
                    and message.images
                ):

                    classification = self.classify_midjourney_message(message)
                    if classification is None:
                        continue

                    is_midjourney_grid = (
                        classification == MidJourneyImageType.MIDJOURNEY_GRID
                    )

                    if (
                        len(message.images) == 1
                        and is_midjourney_grid
                        and self.match_mid_journey_prompt_ignoring_urls(
                            prompt, message.content
                        )
                    ):
                        download_url = message.images[0]
                        file_name = download_url.split("/")[-1].split("?")[0]
                        _log.info(f"Downloading image: {file_name}")
                        # Assuming it should be a GET request
                        response = requests.get(download_url)
                        image = Image.open(BytesIO(response.content))
                        metadata = (
                            image.info
                        )  # Assuming image.info gives metadata in Pillow

                        images = self._split_in_four(image)
                        image_paths = []
                        for i, image in enumerate(images):
                            image_name = f"{file_name}-{i}.png"
                            image.save(image_name, **metadata)
                            image_paths.append(os.path.join(os.getcwd(), image_name))
                            _log.info(f"Saved image: {file_name}-{i}.png")

                        _log.info("Image generated: " + str(image))
                        return image_paths

            time.sleep(1)

    @staticmethod
    def _split_in_four(image: Image) -> list[Image]:
        width, height = image.size
        images = [
            image.crop((0, 0, math.floor(width / 2), math.floor(height / 2))),
            image.crop((math.floor(width / 2), 0, width, math.floor(height / 2))),
            image.crop((0, math.floor(height / 2), math.floor(width / 2), height)),
            image.crop((math.floor(width / 2), math.floor(height / 2), width, height)),
        ]
        return images

    @staticmethod
    def classify_midjourney_message(
        message: DiscordMessage,
    ) -> MidJourneyImageTypeLiteral | None:

        progress_regexp = r"\((100|[1-9]?\d)%\)"
        image_number_regexp = r"\*\* - Image #(\d+) <@"
        variations_regexp = r" - Variations by @.+ \("

        if re.search(progress_regexp, message.content):
            return None

        image_number_regexp = re.search(image_number_regexp, message.content)
        if len(message.images) > 0 and image_number_regexp:
            return MidJourneyImageType.MIDJOURNEY_UPSCALE

        if len(message.images) > 0 and re.search(r" - @.+ \(", message.content):
            return MidJourneyImageType.MIDJOURNEY_GRID
        if len(message.images) > 0 and re.search(variations_regexp, message.content):
            return MidJourneyImageType.MIDJOURNEY_GRID

        return None

    @staticmethod
    def match_mid_journey_prompt_ignoring_urls(
        prompt: str, message_content: str
    ) -> bool:
        """
        Function to check if the '_match' string contains the '_input' string,
        after replacing any occurrence of a URL with '<URL>' and converting
        to lower case.
        """
        # Regular expression pattern for URLs
        url_pattern = r"(<?https?:\/\/[^\s]+>?)"

        # Convert to lower case and replace URLs
        prompt = re.sub(url_pattern, "<URL>", prompt.lower())
        message_content = re.sub(url_pattern, "<URL>", message_content.lower())

        return prompt in message_content
