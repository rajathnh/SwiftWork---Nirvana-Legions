import pandas as pd
import random


# Predefined domain weights and categories  

# complexity ratings for domains, types, and purposes
domain_weights = {
    "Web Development": 7, "Mobile App Development": 8, "Data Science": 9,"IT Support and Maintenance":6, "Content Writing":4,
    "Graphic Design": 5, "Digital Marketing": 6, "Audio and Music Production":6, "UI/UX Design":6, "Virtual Assistance":4,
    "Cybersecurity": 9, "Blockchain": 9, "Artificial Intelligence": 10, "Video Editing": 5, "Game Development":8
}


# Domain-specific categories with valid combinations
domain_specific_categories = {
    "Web Development": {
        "types": {"static website": 7, "responsive website": 12 , "API integration": 14,"single-page application":15,"Progressive Web App (PWA)":17, "Web portal": 16, "Content management system": 13, "E-commerce website":18,},

        "purposes": { "e-commerce platform": 15, "portfolio showcase": 10, "blog platform": 9, "business website": 12, "landing page": 11, "news site": 13, "online community": 14, "social media platform": 16
        }
    },
    "Mobile App Development": {
        "types": {"mobile application": 13,"Push notification system": 12, "Payment gateway integration":15, "Cross-platform app":16, "Native app":17,  "Hybrid app":15,  "mobile game":19 , "Location-based app":18,
    },
       "purposes": {
            "food delivery service": 15, "user authentication": 12, 
            "subscription management": 14, "task management": 13, 
            "fitness tracker": 13, "social networking": 17, 
            "e-commerce": 15, "ride-sharing": 18, "banking app": 17
        }
    },

    "Data Science": {
        "types": { "data dashboard": 12, "API integration":13, "Predictive analytics system":18, "Data pipeline":15, "Machine learning model":20, "Data cleaning":10, "ETL system":16, "Business intelligence system":17},
        "purposes": {
            "financial analysis": 15, "data visualization": 14, "fraud detection": 18, 
            "customer segmentation": 17, "sales forecasting": 16, 
            "market trend analysis": 16, "recommendation system": 18, 
            "healthcare analytics": 19
    }},

    "Video Editing": {
    "types": {
        "video editing": 8,
        "motion graphics": 15,
        "animation": 18,
        "color grading": 14,
        "video mixing": 12,
        "sound editing": 13,
        "special effects": 17,
        "subtitling": 9
    },
    "purposes": {
        "social media campaign": 10,
        "short film": 15,
        "corporate video": 13,
        "music video": 16,
        "advertisement": 17,
        "educational content": 12,
        "documentary": 18,
        "event coverage": 11
    }
},

    "Digital Marketing" :{
    "types": {
        "social media campaign": 10,
        "SEO strategy": 13,
        "content calendar": 9,
        "email marketing": 11,
        "PPC campaign": 14,
        "affiliate marketing": 12,
        "influencer marketing": 15,
        "video marketing": 16
    },
    "purposes": {
        "branding campaigns": 13,
        "lead generation": 14,
        "website traffic optimization": 12,
        "customer retention": 11,
        "product launch": 14,
        "app promotion": 12,
        "event promotion": 10,
        "content marketing": 13
    }
},
   "Content Writing":{
    "domain_rating": 4,
    "types": {
        "blog post": 7,
        "white paper": 15,
        "SEO strategy": 14,
        "eBook": 16,
        "article": 8,
        "press release": 12,
        "newsletter": 9,
        "case study": 13
    },
    "purposes": {
        "branding campaigns": 13,
        "lead generation": 14,
        "blog platform": 9,
        "thought leadership": 15,
        "product reviews": 10,
        "how-to guides": 12,
        "company updates": 11,
        "content strategy": 14
    }
},

    "Cybersecurity": {
    "types": {
        "penetration testing": 17,
        "security audit": 16,
        "vulnerability assessment": 15,
        "firewall implementation": 14,
        "network monitoring": 12,
        "data encryption": 18,
        "incident response": 16,
        "malware analysis": 19
    },
    "purposes": {
        "data protection": 18,
        "user authentication": 16,
        "system hardening": 17,
        "compliance (GDPR, HIPAA)": 15,
        "network security": 17,
        "threat detection": 18,
        "business continuity planning": 15,
        "cloud security": 16
    }
},

    "Blockchain": {
        "types": {
        "smart contract development": 18,
        "blockchain integration": 17,
        "decentralized storage system": 16,
        "private blockchain setup": 19,
        "cryptocurrency development": 20,
        "NFT platform": 17,
        "ICO development": 18,
        "dApp development": 19
    },
    "purposes": {
        "payment gateway": 18,
        "data protection": 19,
        "decentralized finance (DeFi)": 20,
        "supply chain management": 17,
        "voting systems": 18,
        "identity verification": 16,
        "digital assets": 19,
        "tokenized economy": 20
    }
    },

    "Artificial Intelligence": {
        "types": {
        "AI model development": 18,
        "natural language processing system": 19,
        "computer vision system": 19,
        "chatbot development": 17,
        "speech recognition": 18,
        "machine learning": 17,
        "reinforcement learning": 20,
        "deep learning": 20
    },
    "purposes": {
        "financial analysis": 16,
        "predictive analytics": 17,
        "fraud detection": 18,
        "image recognition": 19,
        "sentiment analysis": 18,
        "customer service automation": 17,
        "personal assistants": 18,
        "autonomous vehicles": 20}
    },

    "Graphic Design": {
        "types": {
        "logo design": 10,
        "infographic design": 12,
        "branding package": 15,
        "business card design": 9,
        "web design": 14,
        "social media graphics": 13,
        "poster design": 11,
        "flyer design": 10
    },
    "purposes": {
        "portfolio showcase": 9,
        "branding campaigns": 15,
        "event promotion": 13,
        "product packaging": 14,
        "advertising": 14,
        "website design": 16,
        "print media": 12,
        "corporate identity": 15
    }
    },

    

    "Game Development":{
        "types": {
        "2D game development": 10,
        "3D game development": 15,
        "virtual reality (VR) game": 18,
        "augmented reality (AR) game": 17,
        "multiplayer game development": 19,
        "game asset creation": 12,
        "game UI/UX design": 10,
        "game engine scripting": 20
    },
    "purposes": {
        "entertainment": 10,
        "education": 14,
        "gaming platforms": 15,
        "virtual reality experiences": 18,
        "augmented reality applications": 17,
        "training simulations": 16,
        "game distribution platforms": 15,
        "eSports": 19
    }
    },

     "UI/UX Design":{
        "types": {
        "user interface design": 10,
        "user experience research": 14,
        "wireframing and prototyping": 12,
        "interactive design": 15,
        "usability testing": 13,
        "design system creation": 16,
        "mobile-first design": 12,
        "accessibility compliance": 17
    },
    "purposes": {
        "product development": 15,
        "website optimization": 14,
        "mobile app design": 16,
        "brand consistency": 15,
        "usability improvement": 13,
        "user engagement": 14,
        "accessibility improvements": 17,
        "customer experience enhancement": 16
    }},


    "DevOps and Cloud Services":{
        "types": {
        "infrastructure as code (IaC)": 14,
        "cloud migration": 16,
        "CI/CD pipeline setup": 15,
        "containerization": 18,
        "serverless architecture": 17,
        "cloud-based monitoring and logging": 13,
        "database setup and management": 14,
        "load balancing": 19
    },
    "purposes": {
        "application deployment": 14,
        "scalability": 18,
        "high availability": 17,
        "cost optimization": 15,
        "data storage solutions": 16,
        "disaster recovery": 16,
        "continuous integration and delivery": 15,
        "system automation": 17
    }},

   
    "IT Support and Maintenance":{
        "types": {
        "system administration": 13,
        "IT troubleshooting": 11,
        "software updates and patches": 10,
        "network setup and maintenance": 15,
        "data backup and recovery": 14,
        "remote technical support": 10,
        "helpdesk setup": 12,
        "hardware diagnostics": 13
    },
    "purposes": {
        "network security": 15,
        "system performance optimization": 14,
        "business continuity": 13,
        "data protection": 14,
        "incident response": 16,
        "remote assistance": 12,
        "end-user support": 11,
        "disaster recovery planning": 17
    }
    },

    "Audio and Music Production":{
        "types": {
        "podcast editing": 10,
        "background score composition": 16,
        "voice-over recording": 9,
        "sound effects creation": 14,
        "music mixing and mastering": 17,
        "audio restoration and cleanup": 15,
        "jingle production": 12,
        "custom sound design": 18
    },
    "purposes": {
        "branding campaigns": 14,
        "advertising": 15,
        "film and television": 18,
        "game sound design": 17,
        "music production": 16,
        "social media content": 13,
        "educational content": 14,
        "audio content for podcasts": 12
    }
    },

    "Virtual Assistance":{
         "types": {
        "administrative support": 8,
        "email and calendar management": 7,
        "customer support": 9,
        "data entry": 5,
        "online research": 8,
        "e-commerce store management": 12,
        "social media management": 11,
        "travel planning": 9
    },
    "purposes": {
        "time management": 8,
        "data organization": 7,
        "customer engagement": 9,
        "schedule optimization": 7,
        "content management": 10,
        "administrative task management": 8,
        "research and reporting": 7,
        "online communication support": 9
    }}
}




# Function to generate a single data entry
def generate_entry():
    domain = random.choice(list(domain_weights.keys()))
    type_ = random.choice(list(domain_specific_categories[domain]["types"].keys()))
    purpose = random.choice(list(domain_specific_categories[domain]["purposes"].keys()))
    domain_rating = domain_weights[domain]
    type_rating = domain_specific_categories[domain]["types"][type_]
    purpose_rating = domain_specific_categories[domain]["purposes"][purpose]
    description = f"{domain} project involving {type_} for {purpose}."
    complexity = domain_rating + type_rating + purpose_rating
    return {
        "Description": description,
        "Domain": domain,
        "Type": type_,
        "Purpose": purpose,
        "Domain Rating": domain_rating,
        "Type Rating": type_rating,
        "Purpose Rating": purpose_rating,
        "Complexity": complexity
    }

# Generate dataset
def generate_dataset(num_entries):
    data = [generate_entry() for _ in range(num_entries)]
    return pd.DataFrame(data)

if __name__ == "__main__":
    num_samples = 10000
    dataset = generate_dataset(num_samples)
    dataset.to_csv("dataset.csv", index=False)
    print(f"Dataset with {num_samples} entries generated and saved to 'dataset.csv'.")
