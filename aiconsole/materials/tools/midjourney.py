from io import BytesIO
import math
import os
from typing import List, Literal
from pydantic import BaseModel
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException
import time
import re
from PIL import Image
from aiconsole.materials.tools.credentials import load_credential
from aiconsole.settings import CREDENTIALS_DIRECTORY


MidJourneyImageType = Literal['MIDJOURNEY_UPSCALE', 'MIDJOURNEY_GRID']

class DiscordMessage(BaseModel):
    id: str
    content: str
    images: list[str]

def classify_midjourney_message(message: DiscordMessage) -> MidJourneyImageType | None:
    import re

    progressRegexp = r"\((100|[1-9]?\d)%\)"
    imageNumberRegexp = r"\*\* - Image #(\d+) <@"

    if re.search(progressRegexp, message.content):
        return None

    imageNumberMatch = re.search(imageNumberRegexp, message.content)
    if len(message.images) > 0 and imageNumberMatch:
        return 'MIDJOURNEY_UPSCALE'

    if len(message.images) > 0 and re.search(r" - @.+ \(", message.content):
        return 'MIDJOURNEY_GRID'
    if len(message.images) > 0 and re.search(r" - Variations by @.+ \(", message.content):
        return 'MIDJOURNEY_GRID'

    return None

def match_mid_journey_prompt_ignoring_urls(prompt: str, message_content: str) -> bool:
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

class MidJourneyAPI:
    driver: webdriver.Chrome | None = None
    webdriver_service: Service | None = None


    def extract_messages(self) -> List[DiscordMessage]:
        if not self.driver:
            raise ValueError('WebDriver not initialized')

        # Locate all messages
        messages = self.driver.find_elements(By.CSS_SELECTOR, 'li[class*="messageListItem-"]')

        extracted_messages = []

        for message in messages:
            # Extract ID
            # extract last segment from data-list-item-id="chat-messages___chat-messages-1142869065577283806-1153420952768626838"
            try: 
                message_id = (message.get_attribute("id", ) or '')
            except AttributeError:
                message_id = None
            except StaleElementReferenceException:
                message_id = None
            except NoSuchElementException:
                message_id = None

            if not message_id:
                continue
            
            # Extract text content
            text_content = ""
            content_div = message.find_element(By.CSS_SELECTOR, "div.markup-eYLPri.messageContent-2t3eCI")
            if content_div:
                text_content = content_div.text

            # Extract image if present
            image_url = ""
            image_element = message.find_elements(By.CSS_SELECTOR, "img.lazyImg-ewiNCh")
            if image_element:
                image_url = image_element[0].get_attribute("src")

            if not image_url:
                image_element = message.find_elements(By.CSS_SELECTOR, "a[class*='originalLink-']")
                if image_element:
                    image_url = image_element[0].get_attribute("href")

            if not image_url:
                continue

            extracted_messages.append(DiscordMessage(
                id= message_id,
                content=text_content,
                images= [image_url]
            ))

        # Print the extracted messages
        return extracted_messages

    def initialize_webdriver(self):
        email = load_credential("midjourney-discord", "email")
        password = load_credential("midjourney-discord", "password")
        server_id = load_credential("midjourney-discord", "server_id")
        channel_id = load_credential("midjourney-discord", "channel_id")

        if self.webdriver_service is None or self.driver is None or not self.driver.session_id:

            # Setup WebDriverManager
            webdriver_service = Service(ChromeDriverManager().install())

            chrome_options = webdriver.ChromeOptions()
            chrome_options.add_argument(f'--user-data-dir={os.path.join(CREDENTIALS_DIRECTORY, "selenium")}')
            chrome_options.add_argument('--headless')


            # Create a new instance of the Google Chrome driver
            self.driver = webdriver.Chrome(options=chrome_options, service=webdriver_service)

        # if we have channelTextArea- element then we are already logged in on the right channel
        if self.driver.find_elements(By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'):
            return

        # Navigate to the art channel
        self.driver.get(f'https://discord.com/channels/{server_id}/{channel_id}')
       
                    
        # Ensure the page is fully loaded
        WebDriverWait(self.driver, 10).until(
            lambda driver: driver.find_elements(By.CSS_SELECTOR, 'input[name="email"]') or 
                            driver.find_elements(By.CSS_SELECTOR, 'div[class*="channelTextArea-"]')
        )
        
        # if we have channelTextArea- element then we are already logged in on the right channel
        if self.driver.find_elements(By.CSS_SELECTOR, 'div[class*="channelTextArea-"]'):
            return

        # Input Credentials and submit
        email_input = self.driver.find_element(By.NAME, 'email')
        email_input.send_keys(email)
        password_input = self.driver.find_element(By.NAME, 'password')
        password_input.send_keys(password)
        password_input.submit()

        # Try again
        self.initialize_webdriver()
        
            

    def create_image(self, prompt: str):
        
        self.initialize_webdriver()

        if not self.driver:
            raise ValueError('WebDriver not initialized')
        
        
        old_message_ids = []

        try:
            # Find the message input box and type your message
            WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'div[class*="channelTextArea-"]')))

            # Focus on the body of the website
            self.driver.find_element(By.CSS_SELECTOR, 'div[class*="channelTextArea-"]').click()

            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.TAB)

            # Save current message ids
            messages = self.extract_messages()
            old_message_ids = [msg.id for msg in messages]

            time.sleep(1)  # Wait for Discord to load the channel
            # Send keys to focused element
            self.driver.switch_to.active_element.send_keys('/imagine')
            WebDriverWait(self.driver, 20).until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'div[class*="autocompleteRowHeading-"]')))
            self.driver.switch_to.active_element.send_keys(Keys.RETURN)

            # Replace 'your_message' with the message you want to send
            self.driver.switch_to.active_element.send_keys(prompt)
            self.driver.switch_to.active_element.send_keys(Keys.RETURN)

            print("Prompt sent, monitoring for results ...")

            #wait until the image is generated <a tabindex="-1" aria-hidden="true" class="originalLink-Azwuo9" href="https://cdn.discordapp.com/ephemeral-attachments/1151665233321001030/1159285806364626954/mcielecki_A_cinematic_portrait_of_Yoda_the_wise_Jedi_Master_fro_26ca108e-e373-45e7-83e6-f96f685ada66.png?ex=6530780a&amp;is=651e030a&amp;hm=0dcc9ce69616c76897d442c1c62818f0eb63ec9a6231348ca2b86736a757971a&amp;" data-role="img" data-safe-src="https://media.discordapp.net/ephemeral-attachments/1151665233321001030/1159285806364626954/mcielecki_A_cinematic_portrait_of_Yoda_the_wise_Jedi_Master_fro_26ca108e-e373-45e7-83e6-f96f685ada66.png?ex=6530780a&amp;is=651e030a&amp;hm=0dcc9ce69616c76897d442c1c62818f0eb63ec9a6231348ca2b86736a757971a&amp;=&amp;width=1100&amp;height=616"></a>
            while True:
                messages = self.extract_messages()

                for message in messages:
                    if match_mid_journey_prompt_ignoring_urls(prompt, message.content) and message.id not in old_message_ids:
                        if message.images:

                            classificationOrUndefined = classify_midjourney_message(message)
                            if classificationOrUndefined is None:
                                continue

                            classification = classificationOrUndefined
                            splitIntoFour = classification == 'MIDJOURNEY_GRID'

                            if len(message.images) == 1 and classification == 'MIDJOURNEY_GRID' and match_mid_journey_prompt_ignoring_urls(prompt, message.content):
                                downloadUrl = message.images[0]
                                fileName = downloadUrl.split('/')[-1].split('?')[0]
                                print(f'Downloading image: {fileName}')
                                # Assuming it should be a GET request
                                response = requests.get(downloadUrl)
                                image = Image.open(BytesIO(response.content))
                                metadata = image.info  # Assuming image.info gives metadata in Pillow

                                if splitIntoFour:
                                    width, height = image.size
                                    images = [
                                        image.crop((0, 0, math.floor(width/2), math.floor(height/2))),
                                        image.crop((math.floor(width/2), 0, width, math.floor(height/2))),
                                        image.crop(
                                            (0, math.floor(height/2), math.floor(width/2), height)),
                                        image.crop((math.floor(width/2), math.floor(height/2),
                                                width, height)),
                                    ]
                                else:
                                    images = [image]

                                for i, image in enumerate(images):
                                    image.save(f'{fileName}-{i}.png', **metadata)
                                    print(f'Saved image: {fileName}-{i}.png')

                                print("Image generated: " + str(image))
                                return image
                
                time.sleep(1)

        finally:
            self.driver.quit()
            pass
