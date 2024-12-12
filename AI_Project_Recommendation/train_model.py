import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# 1. Load Freelancer Skills DataFrame from CSV
freelancer_skills_df = pd.read_csv('freelancer_skills.csv')

# 2. Load Previously Completed Projects DataFrame from CSV (Optional)
completed_projects_df = pd.read_csv('completed_projects.csv')

# 3. Load Client Projects DataFrame from CSV
client_projects_df = pd.read_csv('client_projects.csv')

# Helper function to vectorize skills into a binary vector
def vectorize_skills(skills_list, all_skills):
    return [1 if skill in skills_list else 0 for skill in all_skills]

# Get a list of all unique skills from both freelancer and client projects
all_skills = list(set(','.join(freelancer_skills_df['Skills']).split(', ') + 
                      ','.join(client_projects_df['Skills Required']).split(', ')))

# Vectorize freelancer's skills
freelancer_skills = freelancer_skills_df['Skills'].iloc[0].split(', ')
freelancer_vector = vectorize_skills(freelancer_skills, all_skills)

# Vectorize client projects' required skills
client_projects_df['Skills Vector'] = client_projects_df['Skills Required'].apply(lambda x: vectorize_skills(x.split(', '), all_skills))

# Calculate similarity between freelancer's skills and each client project
def get_project_suggestions(freelancer_vector):
    similarities = []
    
    for i, row in client_projects_df.iterrows():
        similarity = cosine_similarity([freelancer_vector], [row['Skills Vector']])[0][0]
        similarities.append((row['Project Name'], similarity, row['Estimated Time (Hours)'], row['Offered Price (USD)']))
    
    # Sort by similarity score and suggest top 3 projects
    sorted_suggestions = sorted(similarities, key=lambda x: x[1], reverse=True)
    return sorted_suggestions[:3]  # Top 3 projects

# Get project suggestions for the freelancer
suggested_projects = get_project_suggestions(freelancer_vector)

print("Suggested Projects for Freelancer:")
for proj in suggested_projects:
    print(f"Project Name: {proj[0]}, Similarity: {proj[1]:.2f}, Estimated Time: {proj[2]} hours, Price: ${proj[3]}")

# Select the best project among the suggestions based on similarity
def suggest_best_project(suggested_projects):
    best_project = max(suggested_projects, key=lambda x: x[1])  # Best project based on skills similarity
    print(f"\nBest Project for Freelancer:")
    print(f"Project Name: {best_project[0]}")
    print(f"Similarity: {best_project[1]:.2f}")
    print(f"Estimated Time: {best_project[2]} hours")
    print(f"Offered Price: ${best_project[3]}")

# Suggest the best project based on skills similarity
suggest_best_project(suggested_projects)