// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: "Dinesh Kumar",
  role: "Full Stack Developer",
  headline: "Associate Software Engineer @ Energyforge",
  specialization: "Python · Django · React · Next.js · WordPress · REST APIs · MySQL",
  location: "Delhi NCR, India",
  bio: "Results-driven Full Stack Developer with 3+ years of hands-on experience building scalable web applications and internal business tools for international and enterprise clients. I work across Python, Django, React, MySQL, WordPress and Elementor — from responsive UIs and RESTful APIs to asset-management platforms — and use AI tools to ship faster without cutting corners.",
  resume: "assets/Dinesh-Kumar-Resume.pdf",
  avatar: "assets/avatar.jpeg",
  email: "boxerdinesh88@gmail.com",
  whatsapp: "https://wa.me/917827484657",
  github: "https://github.com/boxerdinesh88-png",
  linkedin: "https://www.linkedin.com/in/dinesh-kumar-6a6b9530b",
  stats: [
    { value: 3, suffix: "+", label: "Years experience" },
    { value: 24, suffix: "+", label: "Projects shipped" },
    { value: 3, suffix: "", label: "Companies" },
  ],
};

export const services = [
  { title: "Full Stack Development", text: "End-to-end web apps with React / Next.js on the front and Django / Python on the back." },
  { title: "Backend & REST APIs", text: "Secure, high-performance APIs with Django REST Framework, token auth and clean data models." },
  { title: "WordPress & Elementor", text: "Custom themes, scoped-CSS widgets and plugin integration for business websites in any industry." },
  { title: "Responsive UI & Motion", text: "Pixel-perfect, fluid interfaces with GSAP and scroll-driven animation that feel alive." },
  { title: "AI-Enhanced Delivery", text: "ChatGPT & Claude in the workflow to accelerate development and raise code quality." },
];

// featured: shown in the horizontal-scroll showcase
export const featured = [
  {
    title: "Karigarr Jewels", subtitle: "Gemological Certification System", year: "2026", img: "assets/projects/karigarr.webp",
    text: "Secure certificate generation, gemstone records management and an admin dashboard.",
    stack: ["Django REST", "React", "MySQL", "PythonAnywhere"], link: "https://gtlrc.com",
  },
  {
    title: "Phagendrababu Library", subtitle: "Library Seat-Booking Platform", year: "2026", img: "assets/projects/library.webp",
    text: "Next.js front end with a Django REST backend deployed as a separate service.",
    stack: ["Next.js", "Django REST", "Python"], link: "https://phagendrababulibrary.in", github: "https://github.com/boxerdinesh88-png/lib",
  },
  {
    title: "Asset Inventory System", subtitle: "Real-time Asset & Certificate Tracking", year: "2026", img: "assets/projects/asset.webp",
    text: "Live asset location, certificate-expiry alerts and returns/damage records across the asset lifecycle.",
    stack: ["Django REST", "React", "Python"], link: "https://assetinventorys.pythonanywhere.com",
  },
  {
    title: "Inventory Tool", subtitle: "Vendor Expense & Asset Search", year: "2026", img: "assets/projects/inventory.webp",
    text: "Vendor-wise expense analysis and asset search to find which vendor or category drives the highest cost.",
    stack: ["Django", "React", "REST API"], link: "https://inventorytool.pythonanywhere.com",
  },
  {
    title: "Event Directory", subtitle: "Event Platform with OTP & Google OAuth", year: "2026", img: "assets/projects/events.webp",
    text: "Multi-role dashboards, registration tracking, dynamic filters and a full admin control system.",
    stack: ["Django", "MySQL", "Google OAuth", "Bootstrap 5"], link: "https://eventdirectory.pythonanywhere.com/auth/login/", github: "https://github.com/boxerdinesh88-png/event-directory",
  },
  {
    title: "Shining Services India", subtitle: "Business Platform & Booking App", year: "2025", img: "assets/projects/shining.webp",
    text: "Django server-rendered platform with secure contact pipelines, admin notifications and caching.",
    stack: ["Django", "MySQL", "JavaScript"], link: "https://shiningservicesindia.com", github: "https://github.com/boxerdinesh88-png/Shi-ning-services",
  },
];

// cat: "wp" = WordPress / client sites, "ec" = e-commerce / custom builds, "fe" = front-end builds
export const projects = [
  { cat: "ec", title: "RDX Denim", subtitle: "Denim e-commerce store & wholesale B2B", img: "assets/projects/rdxdenim.webp", stack: ["PHP", "JavaScript", "E-commerce"], link: "https://rdxdenim.com/" },
  { cat: "wp", title: "UTSI International", subtitle: "OT/ICS cybersecurity company website", img: "assets/projects/utsi.webp", stack: ["WordPress", "Elementor"], link: "https://utsi.com/" },
  { cat: "ec", title: "The Mad Chandler", subtitle: "Hand-poured candle store (San Diego)", img: "assets/projects/madchandler.webp", stack: ["WordPress", "WooCommerce"], link: "https://madchandler.com/" },
  { cat: "wp", title: "HRD Infratech", subtitle: "Construction, interiors & hospital fit-outs", img: "assets/projects/hrdinfratech.webp", stack: ["WordPress", "Elementor"], link: "https://hrdinfratech.com/" },
  { cat: "wp", title: "Mishak Enterprises", subtitle: "City gas distribution O&M services", img: "assets/projects/mishak.webp", stack: ["WordPress", "Elementor"], link: "https://mishakenterprises.in/" },
  { cat: "wp", title: "Spartakus Insurance", subtitle: "Insurance services website", img: "assets/projects/spartakus.webp", stack: ["WordPress", "Elementor"], link: "https://spartakusinsurance.com" },
  { cat: "wp", title: "Silver Sandstone", subtitle: "Luxury travel & hospitality", img: "assets/projects/silversandstone.webp", stack: ["WordPress", "Elementor", "JS"], link: "https://silversandstonehospitality.com" },
  { cat: "wp", title: "Happy Home IC", subtitle: "Interior & construction landing", img: "assets/projects/happyhome.webp", stack: ["WordPress", "Elementor"], link: "https://happyhomeic.com" },
  { cat: "wp", title: "Navsandhya Tapes", subtitle: "Industrial tape manufacturer", img: "assets/projects/navsandhya.webp", stack: ["WordPress", "Elementor", "JS"], link: "https://navsandhyatapes.co.in" },
  { cat: "wp", title: "Greenmont", subtitle: "Business website", img: "assets/projects/greenmont.webp", stack: ["WordPress", "Elementor"], link: "https://greenmont.in" },
  { cat: "wp", title: "Jessica Yaffa", subtitle: "Performance optimization", img: "assets/projects/jessica.webp", stack: ["WordPress", "Page Speed"], link: "https://jessicayaffa.org" },
  { cat: "wp", title: "Home Groom Pets", subtitle: "Pet grooming services", img: "assets/projects/homegroom.webp", stack: ["WordPress", "Elementor"], link: "https://homegroompets.in" },
  { cat: "wp", title: "AC Repair Service", subtitle: "Appliance repair website", img: "assets/projects/acrepair.webp", stack: ["WordPress", "Elementor"], link: "https://itdservicecenter.online/" },
  { cat: "fe", title: "Makeup Forever", subtitle: "Salon & academy brand site", img: "assets/projects/makeup.webp", stack: ["Bootstrap 5", "Maps API"], link: "https://boxerdinesh88-png.github.io/makeupforever/" },
  { cat: "fe", title: "Smart Parking", subtitle: "Slot tracking & booking UI", img: "assets/projects/parking.webp", stack: ["JavaScript", "UI/UX"], link: "https://boxerdinesh88-png.github.io/parking-web/" },
  { cat: "fe", title: "Gym & Fitness", subtitle: "Membership landing page", img: "assets/projects/gym.webp", stack: ["JavaScript", "Scroll FX"], link: "https://boxerdinesh88-png.github.io/gym/" },
  { cat: "fe", title: "Car Showcase", subtitle: "Premium product landing", img: "assets/projects/car.webp", stack: ["JavaScript", "Animation"], link: "https://boxerdinesh88-png.github.io/car-website/" },
  { cat: "fe", title: "Maxent Food", subtitle: "Restaurant menu platform", img: "assets/projects/maxent.webp", stack: ["JavaScript", "Cart"], link: "https://boxerdinesh88-png.github.io/mexentfood/" },
];

export const experience = [
  {
    company: "Energyforge Equipments & Engineers LLP", role: "Associate Software Engineer", period: "Aug 2026 — Present", place: "Ghaziabad", current: true,
    points: [
      "Full-stack development of the company's engineering and operations tools.",
      "Building and maintaining internal web apps with Python, Django and React in production.",
    ],
  },
  {
    company: "Creative Squadz", role: "Full Stack Developer", period: "May 2026 — Aug 2026", place: "Delhi NCR",
    points: [
      "Built and maintained full-stack web apps and WordPress / Elementor sites for clients.",
      "Delivered live projects including happyhomeic.com with responsive, cross-platform UI.",
    ],
  },
  {
    company: "ProAce International Inc.", role: "Full Stack Developer (Freelance)", period: "Jan 2025 — Apr 2025", place: "New York · Remote",
    points: [
      "Full-stack apps with Python, Django and React for international clients.",
      "Designed and consumed RESTful APIs; optimized MySQL and resolved performance bottlenecks.",
      "Delivered 6+ live client websites across real-estate, industrial and service sectors.",
    ],
  },
];

// level: 3 = Expert, 2 = Advanced, 1 = Intermediate · icon = file in assets/stack/
export const skills = [
  { group: "Frontend", blurb: "Interfaces, motion & 3D", items: [
    { name: "HTML5 / CSS3", level: 3, icon: "html5" },
    { name: "React.js", level: 2, icon: "react" },
    { name: "JavaScript", level: 2, icon: "javascript" },
    { name: "Tailwind & Bootstrap", level: 2, icon: "tailwindcss" },
    { name: "GSAP Animations", level: 2 },
    { name: "Next.js", level: 1, icon: "nextjs" },
    { name: "TypeScript", level: 1, icon: "typescript" },
    { name: "Three.js", level: 1, icon: "threejs" },
  ] },
  { group: "Backend", blurb: "APIs, auth & business logic", items: [
    { name: "Python", level: 3, icon: "python" },
    { name: "Django", level: 2, icon: "django" },
    { name: "REST APIs", level: 2 },
    { name: "Node.js", level: 1, icon: "nodejs" },
  ] },
  { group: "CMS", blurb: "WordPress sites that convert", items: [
    { name: "WordPress", level: 3, icon: "wordpress" },
    { name: "Elementor", level: 3 },
    { name: "Custom Widgets", level: 2 },
    { name: "Theme & Plugins", level: 2 },
  ] },
  { group: "Data", blurb: "Schemas & performance", items: [
    { name: "MySQL", level: 2, icon: "mysql" },
    { name: "Database Design", level: 2 },
  ] },
  { group: "Tools", blurb: "Ship, deploy & design", items: [
    { name: "Git & GitHub", level: 3, icon: "git" },
    { name: "PythonAnywhere", level: 2 },
    { name: "AI (ChatGPT & Claude)", level: 2 },
    { name: "Figma", level: 1, icon: "figma" },
  ] },
];

// kind: "current" | "cert" | "done"
export const education = [
  { title: "BA (2nd Year)", place: "School of Open Learning, Delhi University", period: "2025 — Present", kind: "current" },
  { title: "Full Stack Developer — Python", place: "DUCAT School of AI, Noida", period: "2024 — 2026", kind: "cert", cert: "assets/ducat-certificate.pdf", thumb: "assets/ducat-certificate.webp" },
  { title: "Intermediate (XII)", place: "GMSBV Shahdara, Delhi · CBSE", period: "2021", kind: "done" },
  { title: "High School (X)", place: "SFCS Loni Rampark · UP Board", period: "2019", kind: "done" },
];
