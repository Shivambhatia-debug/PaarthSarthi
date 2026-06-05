const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

// DNS server fix for SRV lookup issues on certain networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const Blog = require('../models/Blog');
const User = require('../models/User');

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for extra seeding...');

    // 1. Get or create an admin for course/blog creator
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'ParthSarthi Admin',
        email: 'admin@parthsarthi.com',
        password: 'admin123456',
        phone: '+919999999999',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
    }

    // 2. Fetch some mentors and mark 4 of them as Featured + Active
    const mentors = await Mentor.find({});
    console.log(`Found ${mentors.length} mentors in the database.`);
    
    if (mentors.length > 0) {
      const mentorsToFeature = mentors.slice(0, 5);
      for (const mentor of mentorsToFeature) {
        mentor.isFeatured = true;
        mentor.isActive = true;
        mentor.isAvailable = true;
        mentor.rating = 4.5 + Math.random() * 0.5;
        mentor.experience = 5 + Math.floor(Math.random() * 8);
        mentor.totalSessions = 50 + Math.floor(Math.random() * 120);
        mentor.totalStudents = 100 + Math.floor(Math.random() * 300);
        mentor.specialization = mentor.specialization.length > 0 ? mentor.specialization : ['Career Guidance', 'Psychometric Analysis', 'College Selection'];
        mentor.languages = mentor.languages.length > 0 ? mentor.languages : ['English', 'Hindi'];
        mentor.sessionPrice = mentor.sessionPrice || 499;
        mentor.sessionTypes = mentor.sessionTypes.length > 0 ? mentor.sessionTypes : ['video', 'audio'];
        await mentor.save();
      }
      console.log(`Successfully featured and updated ${mentorsToFeature.length} mentors!`);
    }

    // 3. Clear existing courses and seed 4 sample courses
    try {
      await Course.collection.dropIndexes();
      console.log('Dropped course indexes.');
    } catch (e) {
      console.log('No course indexes to drop.');
    }
    await Course.deleteMany({});
    console.log('Cleared existing courses.');

    const courseSeeds = [
      {
        title: 'Mastering Psychometric Assessments',
        description: 'Understand your true career potential by mastering self-assessment, cognitive reasoning, and personality profile decoding. This course guides you through mock tests and personal counseling sessions to find the best-fit stream for your education.',
        shortDescription: 'Find your true potential with advanced psychometric counseling.',
        category: 'psychometric',
        language: 'both',
        language_override: 'none',
        level: 'beginner',
        targetProgram: 'all',
        price: 1499,
        discountPrice: 499,
        instructor: mentors[0] ? mentors[0]._id : null,
        instructorName: mentors[0] ? mentors[0].name : 'Dr. Alok Sharma',
        features: [
          'Detailed assessment checklist',
          '3 full mock psychometric tests included',
          '1-on-1 counseling review slot',
          'Career profiling report generation'
        ],
        requirements: [
          'Basic understanding of career streams',
          'No prior preparation needed'
        ],
        enrolledStudents: 1420,
        rating: 4.8,
        totalReviews: 89,
        isPublished: true,
        isFeatured: true,
        isPromoted: true,
        addedBy: admin._id,
        modules: [
          {
            title: 'Introduction to Psychometric Profiling',
            description: 'Learn the fundamentals of psychological assessments.',
            duration: '1.5 hours',
            lessons: [
              { title: 'What is a Psychometric Test?', type: 'video', duration: '15 mins', isFree: true },
              { title: 'Understanding Personality Dimensions', type: 'video', duration: '20 mins' },
              { title: 'Common Mythbusters about Assessments', type: 'article', duration: '10 mins' }
            ]
          },
          {
            title: 'Mock Assessment Runthrough',
            description: 'Practicing real test queries.',
            duration: '2 hours',
            lessons: [
              { title: 'Reasoning and Aptitude Practice', type: 'video', duration: '30 mins' },
              { title: 'Mock Test 1: Self Evaluation', type: 'quiz', duration: '45 mins' }
            ]
          }
        ]
      },
      {
        title: 'Complete Career Roadmap for Engineers',
        description: 'Confused between CSE, ECE, Mechanical, or Civil? Learn about industry requirements, package benchmarks, placement preparation, and off-campus strategies from industry experts working at Google, Amazon, and top startups.',
        shortDescription: 'Step-by-step career navigation roadmap from engineering to high-paying jobs.',
        category: 'career-guidance',
        language: 'english',
        language_override: 'none',
        level: 'intermediate',
        targetProgram: 'college-graduates',
        price: 1999,
        discountPrice: 999,
        instructor: mentors[1] ? mentors[1]._id : null,
        instructorName: mentors[1] ? mentors[1].name : 'Anish Verma',
        features: [
          'Placement resume templates',
          'DSA & core engineering interview guides',
          'LinkedIn networking blueprints'
        ],
        requirements: [
          'Currently pursuing or completed B.Tech/BE'
        ],
        enrolledStudents: 2580,
        rating: 4.9,
        totalReviews: 204,
        isPublished: true,
        isFeatured: true,
        isPromoted: false,
        addedBy: admin._id,
        modules: [
          {
            title: 'Setting up the Foundation',
            description: 'Understanding specialization options.',
            duration: '2 hours',
            lessons: [
              { title: 'Exploring Different B.Tech Specializations', type: 'video', duration: '20 mins', isFree: true },
              { title: 'Industry Demand vs College Curriculum', type: 'video', duration: '25 mins' }
            ]
          }
        ]
      },
      {
        title: 'Communication & Soft Skills Accelerator',
        description: 'Build supreme confidence, remove stage fear, and master the art of public speaking, Group Discussions (GD), and personal interviews. Critical for students transitioning from schools to top colleges.',
        shortDescription: 'Master the art of high-impact corporate communication and public speaking.',
        category: 'communication',
        language: 'both',
        language_override: 'none',
        level: 'beginner',
        targetProgram: 'all',
        price: 999,
        discountPrice: 0,
        isFree: true,
        instructor: mentors[2] ? mentors[2]._id : null,
        instructorName: mentors[2] ? mentors[2].name : 'Sonia Mehra',
        features: [
          'Weekly live speaking drills',
          'GD feedback checklist',
          'Pitch templates'
        ],
        requirements: [
          'Willingness to practice speaking'
        ],
        enrolledStudents: 4120,
        rating: 4.7,
        totalReviews: 312,
        isPublished: true,
        isFeatured: false,
        isPromoted: false,
        addedBy: admin._id,
        modules: [
          {
            title: 'Removing Stage Fear',
            description: 'Overcoming mental blocks.',
            duration: '1 hour',
            lessons: [
              { title: 'Mindset shifts for public speaking', type: 'video', duration: '15 mins', isFree: true }
            ]
          }
        ]
      }
    ];

    await Course.insertMany(courseSeeds);
    console.log('Successfully seeded 3 courses!');

    // 4. Clear existing blogs and seed 4 sample blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs.');

    const blogSeeds = [
      {
        title: 'The Ultimate Guide to Networking: How to Find Mentorship & Land Opportunities',
        content: `<h2>The Hidden Job Market</h2>
<p>Did you know that over <strong>70% of jobs</strong> are never published publicly? They are filled through word-of-mouth, referrals, and internal professional networks. This is what career coaches call the 'Hidden Job Market'. If you are only applying to jobs via standard job portals, you are missing out on the vast majority of opportunities. The key to unlocking this market is active, professional networking.</p>

<h2>1. Building a Giving Mindset</h2>
<p>Many students and freshers make the mistake of reaching out to industry experts only when they need a referral or a job. This transactional approach rarely works. True networking is built on <em>reciprocity</em> and mutual respect. Approach every connection by asking yourself: <strong>"How can I add value to this person?"</strong></p>
<p>Here are a few ways to add value as a student:</p>
<li>Share an interesting article, research paper, or industry report relevant to their field.</li>
<li>Write a summary of a podcast or online talk they hosted, and tag them on LinkedIn with your insights.</li>
<li>Offer to help with open-source projects, testing their software, or providing feedback on their design work.</li>

<h2>2. Crafting High-Converting Cold Messages</h2>
<p>When reaching out on LinkedIn or email, keep your messages short, polite, and specific. Busy professionals rarely read long walls of text. A great cold message follows a simple formula: the hook, the context, and the low-friction ask.</p>
<blockquote>"Hi Dr. Sharma, I read your recent article on psychometric mapping in secondary education. Your point about cognitive testing resonated with me. I'm currently studying career counseling at DU and would love to ask you two quick questions about your methodology. Would you be open to a 10-minute virtual chat next Tuesday?"</blockquote>

<h2>3. Nurturing the Relationship</h2>
<p>Networking is a marathon, not a sprint. Once someone gives you their valuable time, follow up within 24 hours to thank them. Let them know how their advice helped you. Send brief updates every few months about your progress. Over time, these casual connections grow into professional trust, leading to organic referrals and lifelong mentorship.</p>`,
        excerpt: 'Struggling to find the right career direction? Networking is your secret superpower. Learn how to write cold emails and build professional trust.',
        category: 'career-tips',
        thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
        tags: ['networking', 'career', 'mentorship', 'college'],
        author: admin._id,
        authorName: 'ParthSarthi Career Team',
        views: 642,
        likes: 184,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'Roadmap to Becoming a Software Engineer in the AI Era',
        content: `<h2>The Evolving Role of Developers</h2>
<p>With the rise of large language models and code generation tools, the job of a software engineer is shifting from syntax execution to system design and logical problem-solving. Knowing how to code is no longer enough; you must know <strong>what</strong> to build and <strong>how</strong> to verify its correctness. This roadmap outlines how to build a resilient tech career in the age of AI.</p>

<h2>1. Double Down on Computer Science Fundamentals</h2>
<p>AI tools are excellent at writing boilerplate code, but they struggle with complex architectural decisions and debugging deep system bottlenecks. This is why core computer science concepts are more important than ever:</p>
<li><strong>Data Structures & Algorithms:</strong> Focus on complexity, trade-offs, and optimization rather than memorizing solutions.</li>
<li><strong>System Design:</strong> Understand scalability, databases (SQL vs NoSQL), caching, and REST APIs.</li>
<li><strong>OS & Networking:</strong> Learn how memory allocation works, concurrency, and how HTTP requests move across networks.</li>

<h2>2. Mastering AI-Assisted Workflows</h2>
<p>Instead of avoiding AI, integrate it into your development environment to double your productivity. Use tools like GitHub Copilot or ChatGPT to explain complex codebases, write unit tests, and brainstorm edge cases. However, always verify their output. Blindly copying AI code leads to brittle systems and security vulnerabilities.</p>
<blockquote>"The best developers of the next decade will not be those who refuse to use AI, nor those who rely on it entirely. They will be the editors and architects who guide AI tools to build robust systems."</blockquote>

<h2>3. Build Real, End-to-End Projects</h2>
<p>A portfolio of copy-pasted tutorial code will not get you hired. Build unique projects that solve real problems. Host them live, write comprehensive README files, and configure CI/CD pipelines. This demonstrates to employers that you understand the entire software development lifecycle, not just coding in isolation.</p>`,
        excerpt: 'AI is changing the software engineering landscape. Discover the core computer science skills and AI workflows you must master.',
        category: 'technology',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        tags: ['coding', 'software-engineering', 'AI', 'techjobs'],
        author: admin._id,
        authorName: 'Ankit Gupta (Senior SDE)',
        views: 1420,
        likes: 682,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'How to Crack High-Pressure Exams Without Losing Your Mind',
        content: `<h2>The Science of Exam Success</h2>
<p>Preparing for competitive exams like JEE, NEET, or college finals can feel like an uphill battle. Many students believe that studying 14 hours a day is the only path to success, leading to severe burnout and poor memory retention. Cognitive science shows that <strong>how you study</strong> is far more critical than <strong>how long you study</strong>.</p>

<h2>1. Active Recall and Spaced Repetition</h2>
<p>Passively re-reading textbooks or highlighting text is one of the least effective study techniques. Your brain builds stronger neural pathways when it is forced to retrieve information actively. Use active recall by testing yourself with flashcards, closing your books and writing down everything you remember, or solving previous years' question papers under exam conditions.</p>
<p>Pair active recall with spaced repetition: review difficult topics at increasing intervals (e.g., after 1 day, 3 days, 7 days, and 30 days) to lock them into your long-term memory.</p>

<h2>2. The Pomodoro Technique & Deep Work</h2>
<p>Your brain's peak focus window lasts between 25 to 50 minutes. To maintain high cognitive performance:</p>
<li>Work in blocks of 25 minutes (Pomodoro) followed by a 5-minute break to walk around or stretch.</li>
<li>Every 4 blocks, take a longer 30-minute break.</li>
<li>Remove all distractions: put your phone in another room and block social media during study sessions.</li>

<h2>3. Prioritizing Rest & Mental Wellness</h2>
<p>Sleep is when your brain consolidates memory. Pulling all-nighters right before an exam reduces your cognitive capacity by up to 30%. Ensure you get 7-8 hours of sleep. Drink plenty of water and spend 15 minutes outdoors daily. A calm, rested mind will always outperform an anxious, sleep-deprived one on exam day.</p>`,
        excerpt: 'Cognitive science shows that how you study is far more critical than how long you study. Learn techniques like active recall and Pomodoro.',
        category: 'exam-preparation',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        tags: ['exams', 'study-hacks', 'mental-health', 'learning'],
        author: admin._id,
        authorName: 'Dr. Vivek Kumar',
        views: 935,
        likes: 312,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'Mastering Public Speaking & Communication: An Introvert\'s Guide',
        content: `<h2>The Power of Quiet Influence</h2>
<p>Public speaking is often viewed as an extrovert's game. However, some of history's greatest speakers—including Mahatma Gandhi, Eleanor Roosevelt, and Barack Obama—identified as introverts. Introverts possess unique qualities like deep preparation, active listening, and structured thinking that can make them exceptionally powerful communicators.</p>

<h2>1. Leverage Preparation as Your Shield</h2>
<p>Extroverts are often comfortable winging a speech, but introverts thrive on preparation. Use this to your advantage. Research your audience, write a detailed outline (not a word-for-word script, which can sound robotic), and practice out loud. Knowing your material inside-out builds immense internal confidence and eliminates on-stage anxiety.</p>

<h2>2. Structure Your Talk for Impact</h2>
<p>A good speech follows a simple, memorable narrative structure. Keep your audience engaged using the <strong>Hook-Meat-Payoff</strong> formula:</p>
<li><strong>The Hook:</strong> Start with a personal story, an alarming statistic, or a thought-provoking question to grab attention.</li>
<li><strong>The Meat:</strong> Deliver 2 or 3 clear, well-supported points. Avoid information overload.</li>
<li><strong>The Payoff:</strong> End with a call to action or a memorable concluding thought that leaves a lasting impression.</li>

<h2>3. Managing Physiological Anxiety</h2>
<p>It is completely normal to feel your heart racing or palms sweating before speaking. This is just adrenaline. Instead of fighting it, reframe it: tell yourself, <strong>"I am excited, not nervous."</strong> Before stepping on stage, take three deep belly breaths (inhale for 4 seconds, hold for 4, exhale for 6) to activate your parasympathetic nervous system and steady your voice.</p>`,
        excerpt: 'Discover how to leverage your unique strengths as an introvert to prepare, structure, and deliver high-impact presentations.',
        category: 'skill-development',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        tags: ['communication', 'public-speaking', 'confidence', 'softskills'],
        author: admin._id,
        authorName: 'Dr. Alok Sharma',
        views: 812,
        likes: 295,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date()
      }
    ];

    await Blog.insertMany(blogSeeds);
    console.log('Successfully seeded 4 blogs!');

    console.log('All extra seeding operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder execution error:', error);
    process.exit(1);
  }
};

runSeeder();
