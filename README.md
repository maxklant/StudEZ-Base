# StudEZ

A clean, browser-based study tool that helps students master school subjects through interactive quizzes.

This is the **base** (vanilla HTML / CSS / JS) version of StudEZ — no framework, no build step. Just open `index.html`.

## Features

- **Subject-organized quizzes** — pick a topic from the landing page and jump straight into questions
- **Instant feedback** — see correct/incorrect answers as you go
- **Zero install** — pure HTML, CSS, and vanilla JavaScript
- **Quiz library** — multiple quizzes shipped under `quizzes/`, easy to add your own
- **Responsive** — works on phone, tablet, and desktop
- **Font Awesome icons** — clean visual polish via the FA CDN

## Project structure

```
StudEZ-Base/
├── index.html      # landing page (subject selector)
├── quiz.html       # quiz runner
├── script.js       # landing page behavior
├── quiz.js         # quiz engine
├── style.css       # landing page styles
├── quiz.css        # quiz styles
└── quizzes/        # quiz data files
```

## Quick start

No build step. Just open it:

```bash
git clone https://github.com/maxklant/StudEZ-Base.git
cd StudEZ-Base
# Open index.html in your browser, or:
python -m http.server 8000
# then visit http://localhost:8000
```

## Adding a quiz

1. Drop a new file into `quizzes/`
2. Follow the structure of the existing examples
3. Reference it from the landing page in `index.html` / `script.js`

## Related projects

- **StudEZ-school-** — the TypeScript / Webpack edition with XML-based quiz files

## Status

Maintained.

## License

MIT — see `LICENSE` once added.
