# PORTOVA
## Student Portfolio Builder

### 1. Project Overview

**Portova** is a portfolio builder designed for students. It allows students to create professional online portfolios by entering their personal information, adding their educational background, showcasing projects, listing work experience, and providing useful links.

Users can choose from three portfolio templates: Simple, Modern, and Creative. Their portfolios can be saved to an online database using Supabase, allowing them to remain available even after refreshing the page. All student portfolios are displayed on the Student Portfolios page.

Portova also supports local mode, allowing users to create and view portfolios in their browser while the online database is being configured.
## Tables
## Database Structure

Table: `portfolios`

| Column       | Type               | Description                                                                      |
| ------------ | ------------------ | -------------------------------------------------------------------------------- |
| `id`         | uuid (primary key) | Unique portfolio ID, generated automatically                                     |
| `created_at` | timestamptz        | Date and time the portfolio was created                                          |
| `full_name`  | text (required)    | Student's full name                                                              |
| `email`      | text               | Student's email address                                                          |
| `phone`      | text               | Student's contact number                                                         |
| `address`    | text               | Student's address                                                                |
| `about`      | text               | Student's personal introduction or About Me section                              |
| `photo_url`  | text               | Profile picture, resized and stored as an image data URL                         |
| `skills`     | jsonb              | List of student skills, such as HTML and CSS                                     |
| `education`  | jsonb              | List of educational background details, including school, degree, and years      |
| `projects`   | jsonb              | List of projects, including title, description, and link                         |
| `experience` | jsonb              | List of work experience details, including role, company, years, and description |
| `links`      | jsonb              | List of social media profiles and website links, including labels and URLs       |
| `template`   | text               | Selected portfolio template: `simple`, `modern`, or `creative`                   |

### 2. Features and Functionalities

- **Profile Photo Upload** – Uploads a profile picture, crops it into a square, and resizes it directly in the browser.
- **Dynamic Information Fields** – Allows users to add multiple entries for education, projects, work experience, and links using the "Add Another" feature.
- **Three Portfolio Templates** – Provides three different layouts:
  - **Simple:** A clean, resume-style layout.
  - **Modern:** A wide header with organized content cards.
  - **Creative:** A colorful design using different color blocks.
- **Template Switching** – Allows users to change their portfolio template at any time.
- **Student Portfolios Page** – Displays student portfolios and includes a search feature.
- **Edit and Delete Functions** – Allows users to edit or delete portfolios they created in the same browser.
- **Toast Notifications** – Displays messages to inform users about successful actions or errors.
- **Contact Me Button** – Allows visitors to access the contact information provided by a student.
- **Online Database Integration** – Uses Supabase to store portfolio information online.
- **Local Mode** – Allows the website to function without a database connection during development.

### 3. Technologies Used

- **HTML** – Structures the website's pages and content.
- **CSS** – Controls the website's appearance, layout, and responsive design.
- **JavaScript** – Handles form interactions, photo uploads, template selection, notifications, and portfolio management.
- **Supabase** – Provides online database storage for student portfolios.
- **Visual Studio Code** – Used to develop and edit the project.
- **Live Server Extension** – Runs the website locally during development.
- **Net
