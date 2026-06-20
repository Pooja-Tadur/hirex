import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';

const jobsData = [
  { title: 'Frontend Developer', description: 'Build beautiful, performant user interfaces for millions of users worldwide.', company: 'Google', location: 'Hyderabad', jobType: 'Full-time', salary: { min: 600000, max: 1200000 }, skills: ['React', 'JavaScript', 'CSS'], experience: 'Fresher', positions: 4 },
  { title: 'Cloud Solutions Engineer', description: 'Design and deploy scalable cloud infrastructure on Google Cloud Platform.', company: 'Google', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1500000, max: 2500000 }, skills: ['GCP', 'Kubernetes', 'Python'], experience: '2-5 years', positions: 3 },
  { title: 'Backend Developer', description: 'Design and scale REST APIs powering cloud productivity tools used worldwide.', company: 'Microsoft', location: 'Hyderabad', jobType: 'Full-time', salary: { min: 800000, max: 1500000 }, skills: ['Node.js', 'MongoDB', 'Express'], experience: '1-2 years', positions: 5 },
  { title: 'Software Engineer II', description: 'Build enterprise-grade applications on Azure for global customers.', company: 'Microsoft', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1800000, max: 3000000 }, skills: ['C#', '.NET', 'Azure'], experience: '2-5 years', positions: 2 },
  { title: 'Cloud Engineer', description: 'Build and manage scalable cloud infrastructure on AWS for high-traffic systems.', company: 'Amazon', location: 'Chennai', jobType: 'Full-time', salary: { min: 1200000, max: 2000000 }, skills: ['AWS', 'Docker', 'Kubernetes'], experience: '2-5 years', positions: 6 },
  { title: 'SDE I', description: 'Solve complex engineering problems at massive scale for e-commerce systems.', company: 'Amazon', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1600000, max: 2800000 }, skills: ['Java', 'Data Structures', 'AWS'], experience: 'Fresher', positions: 10 },
  { title: 'Software Engineer', description: 'Develop enterprise applications for global clients using Java and Spring Boot.', company: 'TCS', location: 'Mumbai', jobType: 'Full-time', salary: { min: 400000, max: 700000 }, skills: ['Java', 'SQL', 'Spring'], experience: 'Fresher', positions: 25 },
  { title: 'QA Analyst', description: 'Test enterprise software applications for quality and compliance.', company: 'TCS', location: 'Pune', jobType: 'Full-time', salary: { min: 350000, max: 600000 }, skills: ['Selenium', 'Manual Testing', 'SQL'], experience: 'Fresher', positions: 12 },
  { title: 'Data Analyst', description: 'Analyze business data and create dashboards that drive decision-making.', company: 'Infosys', location: 'Hyderabad', jobType: 'Full-time', salary: { min: 500000, max: 800000 }, skills: ['Python', 'SQL', 'Excel'], experience: 'Fresher', positions: 8 },
  { title: 'System Engineer', description: 'Maintain and optimize enterprise systems for global clients.', company: 'Infosys', location: 'Pune', jobType: 'Full-time', salary: { min: 450000, max: 750000 }, skills: ['Java', 'SQL', 'Linux'], experience: 'Fresher', positions: 15 },
  { title: 'QA Engineer', description: 'Design and execute automated test suites to ensure software quality.', company: 'Wipro', location: 'Bangalore', jobType: 'Full-time', salary: { min: 400000, max: 700000 }, skills: ['Selenium', 'Java', 'TestNG'], experience: 'Fresher', positions: 9 },
  { title: 'Cloud Support Engineer', description: 'Provide cloud infrastructure support to enterprise clients globally.', company: 'Wipro', location: 'Chennai', jobType: 'Full-time', salary: { min: 600000, max: 1000000 }, skills: ['AWS', 'Linux', 'Networking'], experience: '1-2 years', positions: 4 },
  { title: 'Mobile Engineer', description: 'Build delightful food-delivery experiences on React Native used by millions daily.', company: 'Swiggy', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1500000, max: 2500000 }, skills: ['React Native', 'Node.js', 'Redux'], experience: '2-5 years', positions: 3 },
  { title: 'Data Scientist', description: 'Build predictive models to optimize delivery times and recommendations.', company: 'Swiggy', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1800000, max: 3200000 }, skills: ['Python', 'Machine Learning', 'SQL'], experience: '2-5 years', positions: 2 },
  { title: 'Product Manager', description: 'Own the product roadmap for our restaurant discovery platform.', company: 'Zomato', location: 'Gurgaon', jobType: 'Full-time', salary: { min: 2000000, max: 4000000 }, skills: ['Product Strategy', 'Analytics', 'Agile'], experience: '2-5 years', positions: 1 },
  { title: 'Backend Developer', description: 'Build resilient APIs serving millions of orders daily.', company: 'Zomato', location: 'Gurgaon', jobType: 'Full-time', salary: { min: 1200000, max: 2000000 }, skills: ['Node.js', 'MongoDB', 'Redis'], experience: '1-2 years', positions: 4 },
  { title: 'Backend Developer', description: 'Build secure, high-throughput payment APIs processing millions of transactions daily.', company: 'Razorpay', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1200000, max: 2000000 }, skills: ['Node.js', 'MongoDB', 'Payments'], experience: '1-2 years', positions: 3 },
  { title: 'DevOps Engineer', description: 'Set up CI/CD pipelines and infrastructure automation for fintech systems.', company: 'Razorpay', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1400000, max: 2400000 }, skills: ['Docker', 'Kubernetes', 'CI/CD'], experience: '2-5 years', positions: 2 },
  { title: 'Android Developer', description: 'Develop and maintain Android applications with 10M+ downloads.', company: 'Paytm', location: 'Noida', jobType: 'Full-time', salary: { min: 600000, max: 1200000 }, skills: ['Kotlin', 'Java', 'Android SDK'], experience: '1-2 years', positions: 5 },
  { title: 'iOS Developer', description: 'Build seamless payment experiences for iOS users.', company: 'Paytm', location: 'Noida', jobType: 'Full-time', salary: { min: 700000, max: 1300000 }, skills: ['Swift', 'iOS SDK', 'Xcode'], experience: '1-2 years', positions: 3 },
  { title: 'Cloud Engineer', description: 'Manage hybrid cloud infrastructure and automate deployments for enterprise clients.', company: 'IBM', location: 'Pune', jobType: 'Full-time', salary: { min: 900000, max: 1800000 }, skills: ['AWS', 'Terraform', 'Linux'], experience: '2-5 years', positions: 6 },
  { title: 'Data Engineer', description: 'Build data pipelines processing terabytes of enterprise data.', company: 'IBM', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1100000, max: 2000000 }, skills: ['Python', 'Spark', 'SQL'], experience: '2-5 years', positions: 4 },
  { title: 'QA Engineer', description: 'Perform manual and automated testing for enterprise client applications.', company: 'Accenture', location: 'Chennai', jobType: 'Full-time', salary: { min: 400000, max: 700000 }, skills: ['Selenium', 'Java', 'TestNG'], experience: 'Fresher', positions: 18 },
  { title: 'Business Analyst', description: 'Bridge business requirements with technical solutions for global clients.', company: 'Accenture', location: 'Mumbai', jobType: 'Full-time', salary: { min: 500000, max: 900000 }, skills: ['Excel', 'SQL', 'Communication'], experience: 'Fresher', positions: 7 },
  { title: 'Machine Learning Engineer', description: 'Build recommendation systems that personalize shopping for millions of users.', company: 'Flipkart', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1800000, max: 3500000 }, skills: ['Python', 'TensorFlow', 'PyTorch'], experience: '2-5 years', positions: 3 },
  { title: 'Frontend Developer', description: 'Build delightful shopping experiences used by millions of customers.', company: 'Flipkart', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1000000, max: 1800000 }, skills: ['React', 'JavaScript', 'Redux'], experience: '1-2 years', positions: 5 },
  { title: 'Software Engineer Intern', description: 'Work alongside senior engineers on real trading and risk systems.', company: 'Goldman Sachs', location: 'Hyderabad', jobType: 'Internship', salary: { min: 60000, max: 80000 }, skills: ['Java', 'Python', 'SQL'], experience: 'Fresher', positions: 20 },
  { title: 'Risk Analyst', description: 'Analyze financial risk models for global trading operations.', company: 'Goldman Sachs', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1500000, max: 2500000 }, skills: ['Python', 'Statistics', 'Excel'], experience: '1-2 years', positions: 2 },
  { title: 'Full Stack Developer', description: 'Join our growing startup to build and ship features end-to-end using the MERN stack.', company: 'TechCorp', location: 'Bangalore', jobType: 'Full-time', salary: { min: 800000, max: 1500000 }, skills: ['React', 'Node.js', 'MongoDB'], experience: '1-2 years', positions: 3 },
  { title: 'DevOps Engineer', description: 'Set up CI/CD pipelines and container orchestration for rapid product iteration.', company: 'TechCorp', location: 'Bangalore', jobType: 'Full-time', salary: { min: 1500000, max: 2500000 }, skills: ['Docker', 'Kubernetes', 'CI/CD'], experience: '2-5 years', positions: 2 },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ✅');

    const recruiter = await User.findOne({ role: 'recruiter' });
    if (!recruiter) {
      console.log('❌ No recruiter found. Please register a recruiter account first.');
      process.exit(1);
    }

    await Job.deleteMany({});
    console.log('🗑️  Old jobs deleted');

    const jobsWithRecruiter = jobsData.map(j => ({
      ...j, postedBy: recruiter._id, applications: [], isActive: true
    }));

    await Job.insertMany(jobsWithRecruiter);
    console.log(`✅ Seeded ${jobsWithRecruiter.length} jobs successfully!`);
    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

run();