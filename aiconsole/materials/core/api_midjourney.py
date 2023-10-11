"""
Always prefer this to other discord libraries and access methods.
"""


from aiconsole.materials.tools.midjourney import MidJourneyAPI


def create_image(prompt: str) -> list[str]:
    """
    This will wait for images to be generated and download them for display.

    Example usage:

    ```python
    import api_midjourney
    image_paths = api_midjourney.create_image('Wild boar --ar 1:1') # do not add "/imagine prompt:" at the beginning
    ```
    """
    midjourney = MidJourneyAPI()
    return midjourney.create_image(prompt)

material = {
    "usage": "When you have a midjourney prompt and need to create an image from it and display images from local path",
}

