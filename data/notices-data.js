/* =====================================================================
   NOTICES DATA  —  naya notice yahan add karein (sabse upar ya kahin bhi; website khud sort karti hai)

   Har notice ka format:
   {
     id: "unique-id",                       // koi bhi unique naam (spaces nahi)
     title: "Notice ka title",
     date: "2026-11-26",                    // YYYY-MM-DD (2 saal/2 digit mahina/2 digit din)
     category: "Admission",                 // Admission | Examination | Academic | Results | Events | General Announcements
     pinned: true,                          // optional: important notice sabse upar rahega
     pdf: "notices/admission-notice.pdf",   // optional: PDF GitHub me 'notices' folder me upload karein
     url: "https://...",                    // optional: kisi website ka link (PDF na ho to)
     note: "Chhoti description"             // optional
   },

   - 'NEW' badge 14 din tak apne aap dikhega (date ke hisaab se).
   - PDF ho to View + Download dono button aate hain.
   - Niche ke 5 notices pehle se website par maujood official ABVMU links hain (bina date).
   ===================================================================== */
window.NOTICE_CATEGORIES = ["Admission", "Examination", "Academic", "Results", "Events", "General Announcements"];

window.NOTICES = [
  /* ---- Apne naye notices yahan add karein (is line ke neeche) ---- */


  /* ---- Existing official links (website par pehle se the) ---- */
  { id: "abvmu-academic-calendar", title: "Academic calendar as per ABVMU schedule", category: "Academic",
    url: "https://abvmuup.edu.in/", note: "See official ABVMU updates" },
  { id: "abvmu-exam-scheme", title: "B.Sc. Nursing examination scheme", category: "Examination",
    url: "https://abvmuup.edu.in/examination_scheme_bscnursing.php", note: "ABVMU official examination page" },
  { id: "abvmu-results", title: "Examination results", category: "Results",
    url: "https://abvmuup.edu.in/exam-result.php", note: "View results on ABVMU" },
  { id: "abvmu-cnet", title: "CNET and counselling notices", category: "Admission",
    url: "https://abvmuup.edu.in/", note: "Follow current ABVMU schedule" },
  { id: "abvmu-holidays", title: "Holiday schedule", category: "General Announcements",
    url: "https://abvmuup.edu.in/", note: "As notified by ABVMU" }
];

/* =====================================================================
   ANNOUNCEMENT BAR (website ke upar sliding patti)
   Khali [] chhodein to bar me upar ke latest notices apne aap chalte hain.
   Alag se likhna ho to aise add karein:
     { text: "Admissions 2026 open", url: "notices.html", new: true },
   ===================================================================== */
window.ANNOUNCEMENTS = [];
