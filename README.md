# JSON viewer

A vanilla js project that I've wanted to do forever now.  
The page fetches a JSON object based on user input, and then recursively renders it.

## Features

- Render any valid JSON object
- Default formatting
- Elements can be edited individually or based on generation history
- Quick formatting

### Plans

This is the proof-of-concept version of the project that demonstrates that everything is possible to expand this into a data-based one-pager creator application.

- More intuitive editing
- More options at element selection
- Modifying the base data
- Saving the created HTML
- Completely doing away with CSS and handling everything through javascript

---

## Project Structure

```plaintext
JSONviewer/
│
├── index.html         # Main HTML file
├── styles.css         # CSS styles
├── script.js          # Main JavaScript logic
├── README.md          # Project documentation
```

---

## Requirements

- Python 3 (for serving files locally)
- Modern web browser (Chrome, Firefox, Edge, etc.)

---

## How to Run

1. **Clone or Download the Repository**

   Download or clone this folder to your computer.

2. **Open a Terminal in the Project Directory**

   Navigate to the `JSONviewer` folder.

3. **Start a Simple Python HTTP Server**

   ```bash
   python -m http.server 8000
   ```

   This will serve the files at [http://localhost:8000](http://localhost:8000).

4. **Open the Application in Your Browser**

   Go to [http://localhost:8000](http://localhost:8000) and open `index.html`.

---

## Usage

- Enter a JSON API URL and (optionally) an API key.
- Click to fetch and render the JSON.
- There is a template url in the code so it will fetch data on an empy input field
- Click on the toggle/class button to choose between
    - individual
    - generation-history based element selection
- Use the editor panel for quick formatting.
- The CSS values must be entered as text, there is no automatic formatting YET
- Click the Apply style button and see the magic

---

## Creator

Balázs Dénes Róbert

