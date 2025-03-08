document.addEventListener("DOMContentLoaded", () => {
    const testList = document.getElementById("test-list");
  
    // List of categories and their specializations
    const tests = [
      {
        category: "Web Development",
        specializations: [
          "HTML Expert",
          "CSS Specialist",
          "JavaScript Developer",
          "React Developer",
          "Node.js Developer",
          "Full-Stack Developer",
          "Responsive Design Expert",
          "WordPress Specialist",
          "E-commerce Developer (Shopify, WooCommerce)",
          "Web Security Specialist"
        ]
      },
      {
        category: "Mobile App Development",
        specializations: [
          "iOS Developer (Swift)",
          "Android Developer (Kotlin/Java)",
          "React Native Developer",
          "Flutter Developer",
          "Mobile UI/UX Specialist",
          "Cross-Platform App Developer"
        ]
      },
      {
        category: "Data Science & Machine Learning",
        specializations: [
          "Data Analyst (SQL, Excel, Python)",
          "Machine Learning Engineer",
          "Deep Learning Specialist",
          "AI Developer",
          "Data Visualization Expert",
          "Data Science with Python",
          "Statistical Analysis Expert"
        ]
      },
      {
        category: "Graphic Design",
        specializations: [
          "Logo Designer",
          "UI/UX Designer",
          "Illustration Artist",
          "Photo Editor (Photoshop/Lightroom)",
          "3D Design Specialist",
          "Web Design Specialist",
          "Print Design Expert"
        ]
      },
      {
        category: "Content Creation",
        specializations: [
          "Copywriting Pro",
          "SEO Content Writer",
          "Blogging Expert",
          "Social Media Content Creator",
          "Video Editor (Premiere Pro, Final Cut)",
          "Podcast Producer",
          "Creative Writer",
          "Proofreading & Editing Specialist"
        ]
      },
      {
        category: "Digital Marketing",
        specializations: [
          "SEO Specialist",
          "PPC Campaign Expert",
          "Social Media Marketing Expert",
          "Google Ads Certified",
          "Facebook Ads Expert",
          "Content Marketing Strategist",
          "Email Marketing Specialist",
          "Affiliate Marketing Expert",
          "Conversion Rate Optimization Specialist"
        ]
      },
      {
        category: "Cybersecurity",
        specializations: [
          "Ethical Hacker",
          "Penetration Tester",
          "Network Security Specialist",
          "Malware Removal Expert",
          "Security Auditor",
          "DDoS Protection Specialist",
          "Cloud Security Expert"
        ]
      },
      {
        category: "Business & Project Management",
        specializations: [
          "Project Manager (Agile/Scrum)",
          "Business Analyst",
          "Product Manager",
          "Scrum Master",
          "Risk Management Expert",
          "Team Leadership Badge",
          "Budget Management Pro"
        ]
      },
      {
        category: "Finance & Accounting",
        specializations: [
          "Certified Accountant",
          "Financial Analyst",
          "Tax Preparation Expert",
          "Investment Planner",
          "QuickBooks Specialist",
          "Business Financial Consultant",
          "Payroll Management Expert",
          "Budgeting & Forecasting Expert"
        ]
      },
      {
        category: "Virtual Assistance",
        specializations: [
          "Virtual Assistant Pro",
          "Customer Support Specialist",
          "Data Entry Expert",
          "Email & Calendar Management",
          "Lead Generation Assistant",
          "Project Management Assistant",
          "Online Research Specialist"
        ]
      },
      {
        category: "Translation & Languages",
        specializations: [
          "Certified Translator (English-Spanish, etc.)",
          "Language Proficiency (e.g., French, Spanish)",
          "Transcription Specialist",
          "Multilingual Content Writer",
          "Localization Specialist",
          "Voiceover Artist"
        ]
      },
      {
        category: "Legal",
        specializations: [
          "Contract Drafting Expert",
          "Intellectual Property Consultant",
          "Corporate Law Specialist",
          "Legal Research Specialist",
          "Business Law Consultant",
          "Employment Law Expert"
        ]
      },
      {
        category: "Sales & Lead Generation",
        specializations: [
          "Lead Generation Pro",
          "Sales Funnel Expert",
          "Telemarketing Specialist",
          "CRM Specialist (Salesforce, HubSpot)",
          "Sales Negotiation Expert",
          "B2B Sales Expert"
        ]
      },
      {
        category: "Engineering & Manufacturing",
        specializations: [
          "Mechanical Engineer",
          "Electrical Engineer",
          "CAD Design Expert",
          "Product Design Specialist",
          "3D Printing Expert",
          "Manufacturing Consultant"
        ]
      },
      {
        category: "Health & Wellness",
        specializations: [
          "Certified Nutritionist",
          "Personal Trainer",
          "Life Coach",
          "Yoga Instructor",
          "Mental Health Counselor",
          "Wellness Coach"
        ]
      },
      {
        category: "Education & Tutoring",
        specializations: [
          "Online Tutor (Subject Specific)",
          "Test Prep Expert (SAT, GRE)",
          "Language Tutor (e.g., English, Spanish)",
          "Curriculum Developer",
          "Special Education Teacher",
          "Subject Matter Expert"
        ]
      },
      {
        category: "Miscellaneous/Soft Skills",
        specializations: [
          "Communication Specialist",
          "Leadership Expert",
          "Time Management Pro",
          "Problem-Solving Specialist",
          "Customer Service Excellence",
          "Team Collaboration Pro"
        ]
      }
    ];
  
    // Dynamically create the HTML for each category and its specializations
    tests.forEach(test => {
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category", "mb-8");
      categoryDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${test.category}</h2>
        <ul class="list-disc pl-5">
          ${test.specializations.map(specialization => `
            <li class="text-lg">${specialization}</li>
          `).join("")}
        </ul>
      `;
      testList.appendChild(categoryDiv);
    });
  });
  