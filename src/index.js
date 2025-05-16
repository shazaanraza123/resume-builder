require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const LatexGenerator = require('./utils/latexGenerator');

const app = express();
const PORT = process.env.PORT || 3000;
const latexGenerator = new LatexGenerator();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use('/public', express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    console.log('Rendering index page...');
    res.render('index', { title: 'Resume Builder' });
});

app.post('/generate', async (req, res) => {
    console.log('Received generate request:', req.body);
    try {
        const { 
            name, 
            position, 
            email, 
            phone, 
            linkedin,
            github,
            website,
            profession,
            education, 
            experience, 
            leadership,
            skills, 
            projects, 
            certifications,
            interests
        } = req.body;
        
        // Generate content based on user input
        const projectsContent = projects ? projects : '\\item None provided';
        const certificationsContent = certifications ? certifications : '';
        const skillsContent = skills ? skills : 'None provided';
        
        // Generate LaTeX content
        console.log('Generating LaTeX content...');
        const latexContent = await latexGenerator.generateResume({
            name,
            position,
            email,
            phone,
            linkedin,
            github,
            website,
            profession,
            education,
            experience,
            leadership,
            skills,
            projects: projectsContent,
            certifications: certificationsContent,
            skills: skillsContent,
            interests
        });

        // Compile to PDF
        console.log('Compiling to PDF...');
        const result = await latexGenerator.compileLatex(latexContent);
        
        console.log('PDF generated successfully:', result.pdfUrl);
        
        // Send both the URL and a success message
        res.json({ 
            success: true, 
            pdfUrl: result.pdfUrl,
            message: 'Resume generated successfully! Click the link to view your resume.'
        });
    } catch (error) {
        console.error('Error generating resume:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`View engine: ${app.get('view engine')}`);
    console.log(`Views directory: ${app.get('views')}`);
    console.log(`Static directories:`);
    console.log(`- ${path.join(__dirname, 'static')}`);
    console.log(`- ${path.join(__dirname, '../public')}`);
}); 