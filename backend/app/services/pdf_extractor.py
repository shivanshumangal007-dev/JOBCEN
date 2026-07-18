import fitz

def extract_text_and_links(file_path: str) -> dict:
    text = ""
    links = []

    with fitz.open(file_path) as doc:
        for page_num, page in enumerate(doc):
            text += page.get_text("text") + "\n"

            for link in page.get_links():
                if link.get("uri"):
                    # get the visible text near the link's rect, if any
                    rect = fitz.Rect(link["from"])
                    anchor_text = page.get_textbox(rect).strip()
                    links.append({
                        "url": link["uri"],
                        "anchor_text": anchor_text or None,
                        "page": page_num + 1
                    })

    return {"text": text, "links": links}