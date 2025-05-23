const fs = require('fs');
const path = require('path');
const latex = require('node-latex');
const { PDFDocument } = require('pdf-lib');

class LatexGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, '../templates/resume.tex');
    }

    async generateResume(data) {
        try {
            // Validate input data
            if (!this.validateInput(data)) {
                throw new Error('Invalid input data');
            }

            // Read the template
            let template = fs.readFileSync(this.templatePath, 'utf8');
            console.log('Template loaded successfully');

            // Replace placeholders with actual data
            template = template.replace(/<<NAME>>/g, this.escapeLatex(data.name));
            template = template.replace(/<<POSITION>>/g, this.escapeLatex(data.position || ''));
            template = template.replace(/<<PHONE>>/g, this.escapeLatex(data.phone));
            template = template.replace(/<<EMAIL>>/g, this.escapeLatex(data.email));
            
            // Format links
            let links = [];
            console.log('Processing links:', { linkedin: data.linkedin, github: data.github, website: data.website });
            
            if (data.linkedin && data.linkedin.trim()) {
                links.push(`\\href{https://linkedin.com/in/${this.escapeLatex(data.linkedin)}}{\\underline{linkedin.com/in/${this.escapeLatex(data.linkedin)}}}`);
            }
            if (data.github && data.github.trim()) {
                links.push(`\\href{https://github.com/${this.escapeLatex(data.github)}}{\\underline{github.com/${this.escapeLatex(data.github)}}}`);
            }
            if (data.website && data.website.trim()) {
                links.push(`\\href{${this.escapeLatex(data.website)}}{\\underline{${this.escapeLatex(data.website)}}}`);
            }
            
            console.log('Formatted links:', links);
            
            // Add links to template with proper separator
            const formattedLinks = links.length > 0 ? ` $|$ ${links.join(' $|$ ')}` : '';
            console.log('Final formatted links:', formattedLinks);
            template = template.replace(/<<ADDITIONAL_LINKS>>/g, formattedLinks);

            // Format profession
            let professionSection = '';
            if (data.profession && data.profession.trim()) {
                professionSection = `\\section{Profession}\n\\resumeSubHeadingListStart\n\\resumeSubheading{${this.escapeLatex(data.profession)}}{}{}{}\n\\resumeSubHeadingListEnd\n`;
            }
            template = template.replace(/<<PROFESSION_SECTION>>/g, professionSection);
            
            // Format education
            let educationSection = '';
            const educationItems = this.formatEducation(data.education);
            if (educationItems && educationItems.trim()) {
                educationSection = educationItems;
            }
            template = template.replace(/<<EDUCATION_SECTION>>/g, educationSection);

            // Format experience
            let experienceSection = '';
            const experienceItems = this.formatExperience(data.experience);
            if (experienceItems && experienceItems.trim()) {
                experienceSection = experienceItems;
            }
            template = template.replace(/<<EXPERIENCE_SECTION>>/g, experienceSection);

            // Format projects
            let projectsSection = '';
            if (data.projects && data.projects.trim()) {
                const projectItems = this.formatProjects(data.projects);
                if (projectItems && projectItems.trim()) {
                    projectsSection = projectItems;
                }
            }
            template = template.replace(/<<PROJECTS_SECTION>>/g, projectsSection);

            // Format certifications
            let certificationsSection = '';
            if (data.certifications && data.certifications.trim()) {
                const certificationItems = this.formatCertifications(data.certifications);
                if (certificationItems && certificationItems.trim()) {
                    certificationsSection = `\\section{Certifications}\n\\resumeSubHeadingListStart\n${certificationItems}\n\\resumeSubHeadingListEnd`;
                }
            }
            template = template.replace(/<<CERTIFICATIONS_SECTION>>/g, certificationsSection);

            // Format leadership
            let leadershipSection = '';
            if (data.leadership && data.leadership.trim()) {
                const leadershipItems = this.formatLeadership(data.leadership);
                if (leadershipItems && leadershipItems.trim()) {
                    leadershipSection = `\\section{Leadership Experience}\n\\resumeSubHeadingListStart\n${leadershipItems}\n\\resumeSubHeadingListEnd`;
                }
            }
            template = template.replace(/<<LEADERSHIP_SECTION>>/g, leadershipSection);

            // Format interests
            let interestsSection = '';
            if (data.interests && data.interests.trim()) {
                interestsSection = `\\section{Interests}\n\\resumeSubHeadingListStart\n\\resumeSubheading{${this.escapeLatex(data.interests)}}{}{}{}\n\\resumeSubHeadingListEnd`;
            }
            template = template.replace(/<<INTERESTS_SECTION>>/g, interestsSection);

            // Format skills
            let skillsSection = '';
            const skillsFormatted = this.formatSkills(data.skills);
            if (skillsFormatted && skillsFormatted.trim()) {
                skillsSection = skillsFormatted;
            }
            template = template.replace(/<<SKILLS_SECTION>>/g, skillsSection);

            // Remove any empty sections
            template = template.replace(/\\section\{[^}]+\}\s*\\resumeSubHeadingListStart\s*\\resumeSubHeadingListEnd/g, '');

            return template;
        } catch (error) {
            console.error('Error generating LaTeX:', error);
            throw error;
        }
    }

    validateInput(data) {
        if (!data.name || !data.email || !data.phone || !data.education || !data.experience || !data.skills) {
            throw new Error('Missing required fields');
        }
        return true;
    }

    formatEducation(education) {
        return education.split('\n')
            .filter(line => line.trim())
            .map(edu => {
                const [school, degree, dates] = edu.split('|').map(part => part.trim());
                if (!school || !degree || !dates) {
                    throw new Error('Invalid education format');
                }
                return `\\resumeSubheading{${this.escapeLatex(school)}}{${this.escapeLatex(dates)}}{${this.escapeLatex(degree)}}{}`;
            })
            .join('\n');
    }

    formatExperience(experience) {
        return experience.split('\n')
            .filter(line => line.trim())
            .map(exp => {
                const [company, position, dates, description] = exp.split('|').map(part => part.trim());
                if (!company || !position || !dates || !description) {
                    throw new Error('Invalid experience format');
                }
                return `\\resumeSubheading{${this.escapeLatex(position)}}{${this.escapeLatex(dates)}}{${this.escapeLatex(company)}}{}
                \\resumeItemListStart
                \\resumeItem{${this.escapeLatex(description)}}
                \\resumeItemListEnd`;
            })
            .join('\n');
    }

    formatProjects(projects) {
        return projects.split('\n')
            .filter(line => line.trim())
            .map(project => {
                const [name, type, date, description] = project.split('|').map(part => part.trim());
                if (!name || !type || !date || !description) {
                    console.log('Invalid project entry:', { name, type, date, description });
                    return '';
                }
                return `\\resumeSubheading{${this.escapeLatex(name)}}{${this.escapeLatex(date)}}{${this.escapeLatex(type)}}{}\n\\resumeItemListStart\n\\resumeItem{${this.escapeLatex(description)}}\n\\resumeItemListEnd`;
            })
            .filter(item => item !== '')
            .join('\n\n');
    }

    formatCertifications(certifications) {
        if (!certifications || certifications.trim() === '') {
            return '';
        }

        const lines = certifications
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            return '';
        }

        return lines.map(cert => {
                const [name, organization, date] = cert.split('|').map(part => part.trim());
                if (!name || !organization || !date) {
                return '';
                }
                return `\\resumeSubheading{${this.escapeLatex(name)}}{${this.escapeLatex(date)}}{${this.escapeLatex(organization)}}{}`;
        }).filter(item => item !== '').join('\n');
    }

    formatSkills(skills) {
        return skills.split('\n')
            .filter(line => line.trim())
            .map(skill => {
                const [category, skillList] = skill.split(':').map(part => part.trim());
                if (!category || !skillList) {
                    throw new Error('Invalid skills format');
                }
                return `\\textbf{${this.escapeLatex(category)}}{: ${this.escapeLatex(skillList)}} \\\\`;
            })
            .join('\n');
    }

    formatLeadership(leadership) {
        return leadership.split('\n')
            .filter(line => line.trim())
            .map(lead => {
                const [organization, role, dates, description] = lead.split('|').map(part => part.trim());
                if (!organization || !role || !dates || !description) {
                    throw new Error('Invalid leadership format');
                }
                return `\\resumeSubheading{${this.escapeLatex(role)}}{${this.escapeLatex(dates)}}{${this.escapeLatex(organization)}}{}
                \\resumeItemListStart
                \\resumeItem{${this.escapeLatex(description)}}
                \\resumeItemListEnd`;
            })
            .join('\n');
    }

    async compileLatex(latexContent) {
        return new Promise((resolve, reject) => {
            try {
                // Create a unique filename
                const filename = `resume_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../../public', filename);
                
                // Ensure the public directory exists
                if (!fs.existsSync(path.join(__dirname, '../../public'))) {
                    fs.mkdirSync(path.join(__dirname, '../../public'), { recursive: true });
                }

                // Create a temporary .tex file
                const texPath = path.join(__dirname, '../../public', `temp_${Date.now()}.tex`);
                fs.writeFileSync(texPath, latexContent);

                // Debug: Log the LaTeX content
                console.log('Generated LaTeX content:', latexContent);

                // Configure LaTeX options
                const options = {
                    inputs: path.join(__dirname, '../../public'),
                    cmd: 'pdflatex',
                    passes: 1,
                    shellEscape: true
                };

                // Create the PDF
                const input = fs.createReadStream(texPath);
                const output = fs.createWriteStream(filePath);
                
                const pdf = latex(input, options);
                
                pdf.pipe(output);
                
                pdf.on('error', (err) => {
                    console.error('LaTeX compilation error:', err);
                    // Clean up the temporary .tex file
                    if (fs.existsSync(texPath)) {
                        fs.unlinkSync(texPath);
                    }
                    reject(err);
                });
                
                pdf.on('finish', () => {
                    // Clean up the temporary .tex file
                    if (fs.existsSync(texPath)) {
                        fs.unlinkSync(texPath);
                    }
                    resolve({
                        pdfUrl: `/public/${filename}`,
                        filePath
                    });
                });
            } catch (error) {
                console.error('Error compiling LaTeX:', error);
                reject(error);
            }
        });
    }

    escapeLatex(text) {
        if (!text) return '';
        // Escape special LaTeX characters
        return text.replace(/[&%$#_{}~^\\]/g, '\\$&');
    }
}

module.exports = LatexGenerator; 