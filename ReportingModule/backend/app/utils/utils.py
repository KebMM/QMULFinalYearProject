#For formatting the pdf export error message in the table

import re

def strip_html_tags(text: str) -> str:
    """Remove HTML tags from a string."""
    if not text:
        return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)
