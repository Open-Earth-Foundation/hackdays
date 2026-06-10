import os
from flask import Flask, render_template_string

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head><title>Hackday App</title></head>
<body style="max-width:720px;margin:0 auto;padding:4rem 2rem;font-family:system-ui">
  <h1>Hackday App</h1>
  <p>Start building! Edit <code>app.py</code></p>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML)

if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
