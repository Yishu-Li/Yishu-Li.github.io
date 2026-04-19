// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "Publications",
          description: "Publications by categories in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "My academic CV.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-meow-3",
          title: "Meow:3",
          description: "other members of the lab",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cats/";
          },
        },{id: "post-astrocyte-regulation-confines-representational-drift-to-null-space",
        
          title: "Astrocyte Regulation Confines Representational Drift to Null-space",
        
        description: "A NEUR 1440 paper on how astrocytic regulation may stabilize neural population manifolds and support long-term iBCIs.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/astrocyte-regulation-null-space/";
          
        },
      },{id: "post-bg-deep-science-hidden-dynamic-inference-based-on-neural-manifolds",
        
          title: "BG Deep Science: Hidden Dynamic Inference Based on Neural Manifolds",
        
        description: "This is the precentation I gave on 2025.08.21 on BrainGate Deep Science meeting.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/hidden-dynamic-inference/";
          
        },
      },{id: "post-neuranil-a-meta-learning-framework-for-brain-to-test-phoneme-decoding",
        
          title: "NeurANIL: A Meta-Learning Framework for Brain-to-Test Phoneme Decoding",
        
        description: "CSCI 1470 final project at Brown",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/NeurANIL/";
          
        },
      },{id: "post-improve-gaussian-naive-bayes-decoders-using-principal-component-analysis",
        
          title: "Improve Gaussian Naive Bayes decoders using Principal Component Analysis",
        
        description: "This is my DATA 2060 Machine Learning final project at Brown",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/PCA-GNB/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-i-joined-braingate-team-and-started-my-research-in-intracortical-brain-computer-interfaces",
          title: 'I joined BrainGate team and started my research in intracortical Brain-computer interfaces! 🧠🦾...',
          description: "",
          section: "News",},{id: "news-i-began-my-ta-role-for-engn-2520-pattern-recognition-and-machine-learning-at-brown-in-spring-2026",
          title: 'I began my TA role for ENGN 2520: Pattern Recognition and Machine Learning...',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%69%73%68%75_%6C%69@%62%72%6F%77%6E.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/Yishu-Li", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/li-yishu", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=-vqnhT4AAAAJ&hl", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
