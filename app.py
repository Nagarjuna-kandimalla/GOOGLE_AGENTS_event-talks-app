from flask import Flask, jsonify, render_template
import requests
import xml.etree.ElementTree as ET
import html
import re

app = Flask(__name__)

# Feed URL
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def parse_release_notes(xml_content):
    try:
        # Standard Atom feeds use namespaces
        root = ET.fromstring(xml_content)
        
        # Atom namespace is typically 'http://www.w3.org/2005/Atom'
        # Let's find the namespace
        ns = ""
        if root.tag.startswith("{"):
            ns = root.tag.split("}")[0] + "}"
            
        entries = []
        for entry in root.findall(f"{ns}entry"):
            title_el = entry.find(f"{ns}title")
            updated_el = entry.find(f"{ns}updated")
            content_el = entry.find(f"{ns}content")
            link_el = entry.find(f"{ns}link")
            
            title = title_el.text if title_el is not None else "No Title"
            updated = updated_el.text if updated_el is not None else ""
            content = content_el.text if content_el is not None else ""
            
            link = ""
            if link_el is not None:
                link = link_el.attrib.get("href", "")
                
            # Clean/parse content HTML if needed
            entries.append({
                "title": title,
                "updated": updated,
                "content": content,
                "link": link
            })
        return entries
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        response = requests.get(FEED_URL, timeout=10)
        if response.status_code == 200:
            notes = parse_release_notes(response.content)
            return jsonify({"status": "success", "data": notes})
        else:
            return jsonify({"status": "error", "message": f"Failed to fetch feed: HTTP {response.status_code}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
