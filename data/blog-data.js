/* =====================================================================
   BLOG DATA — naya article add karne ke liye ek naya { ... } block copy karke yahan paste karein.

   {
     slug: "unique-url-name",          // sirf small letters, numbers aur '-'  (URL me use hota hai)
     title: "Article ka title",
     date: "2026-11-26",               // YYYY-MM-DD
     author: "Author ka naam",
     category: "College Activities",   // College Activities | Nursing Education | Student Achievements |
                                       // Health Awareness | Workshops and Seminars | College News
     cover: "blog/photo.webp",         // optional cover image (GitHub me 'blog' folder me upload karein)
     coverAlt: "Image ka description", // optional
     excerpt: "2-3 line ka short summary (card par dikhta hai)",
     body: `Article ka text.

Naya paragraph ke liye ek khali line chhodein.

## Heading ke liye line ke shuru me ## likhein

- Bullet point
- Dusra point

**bold** aur *italic* bhi chalta hai.`,
     demo: true                        // sirf DEMO article ke liye; real article me ye line hata dein
   }

   Naye article upar rakhein ya neeche — website date ke hisaab se khud sort karti hai.
   ===================================================================== */
window.BLOG_CATEGORIES = ["College Activities", "Nursing Education", "Student Achievements", "Health Awareness", "Workshops and Seminars", "College News"];

window.BLOG_POSTS = [
  {
    slug: "demo-hand-hygiene-basics",
    title: "Hand hygiene basics every health professional should know",
    date: "2026-11-26",
    author: "Demo article",
    category: "Health Awareness",
    excerpt: "A short, general explainer on why hand hygiene matters and the key moments to clean your hands in care settings.",
    demo: true,
    body: `Hand hygiene is one of the simplest and most effective ways to reduce the spread of infection in healthcare settings. It protects patients, health workers and visitors alike.

## Soap and water or hand rub?

The World Health Organization (WHO) recommends alcohol-based hand rub as the preferred method when hands are not visibly soiled. When hands are visibly dirty or contaminated with blood or body fluids, wash them with soap and water.

## The WHO "5 Moments" for hand hygiene

- Before touching a patient
- Before a clean or aseptic procedure
- After a risk of exposure to body fluids
- After touching a patient
- After touching a patient's surroundings

## Good habits

Keep nails short, remove hand and wrist jewellery where possible, and cover all surfaces of the hands and fingers when cleaning.

*This is a sample article created to demonstrate the blog layout. Replace it with your own content.*`
  },
  {
    slug: "demo-nursing-process-five-steps",
    title: "The nursing process in five steps",
    date: "2026-11-25",
    author: "Demo article",
    category: "Nursing Education",
    excerpt: "An introduction to ADPIE, the five-step framework nurses use to plan and deliver patient-centred care.",
    demo: true,
    body: `The nursing process is a systematic, problem-solving framework used to deliver individualised patient care. It is commonly remembered by the acronym **ADPIE**.

## The five steps

1. **Assessment** – collect information about the patient's health status.
2. **Diagnosis** – identify the patient's nursing problems and needs.
3. **Planning** – set goals and decide on the nursing interventions.
4. **Implementation** – carry out the planned care.
5. **Evaluation** – check whether the goals were met and revise the plan if needed.

## Why it matters

The process is cyclical: evaluation often leads back to a fresh assessment. This keeps care responsive to changes in the patient's condition.

*This is a sample article created to demonstrate the blog layout. Replace it with your own content.*`
  },
  {
    slug: "demo-how-to-publish-an-article",
    title: "How to publish your first article on this website",
    date: "2026-11-24",
    author: "Demo article",
    category: "College News",
    excerpt: "A sample post explaining how new articles are added to the College of Nursing website.",
    demo: true,
    body: `This is a placeholder article. It shows how a post appears on the homepage, in the blog listing and on the full article page.

## Adding an article

- Open the file **data/blog-data.js** in the GitHub repository.
- Copy an existing article block and change the title, date, author, category and text.
- Upload a cover image to a **blog** folder and write its path in the *cover* field.
- Save (commit) the file. The article appears on the website after GitHub Pages updates.

## Removing this demo

Delete the three demo blocks (or remove the *demo: true* line from a block to keep it as a real article).`
  }
];
