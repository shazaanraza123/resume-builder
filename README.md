# Instant Resume Builder

A web application that generates professional resumes using LaTeX and the Overleaf CLSI API.

## Features

- Simple web interface for entering resume information
- Professional LaTeX-based resume generation
- PDF output
- Customizable templates

## Prerequisites

- Node.js (v14 or higher)
- npm
- Docker (for running the CLSI service)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up the CLSI service:
```bash
# Clone the CLSI repository
git clone https://github.com/overleaf/clsi.git
cd clsi
npm install
npm start
```

4. Create a `.env` file in the root directory:
```bash
PORT=3000
CLSI_URL=http://localhost:3013
```

5. Start the application:
```bash
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Fill in your resume information in the form
3. Click "Generate Resume" to create your PDF
4. Download and save your resume

## Input Format

### Education
Enter each education entry on a new line in the format:
```
School Name | Degree | Dates
```

### Experience
Enter each experience entry on a new line in the format:
```
Company Name | Position | Dates | Description
```

### Skills
Enter each skill category on a new line in the format:
```
Category: Skill1, Skill2, Skill3
```

## Development

To run the application in development mode with auto-reload:
```bash
npm run dev
```

## License

MIT 