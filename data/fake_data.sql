-- Fake data for role_register
-- Complete schema and seed data: 10 companies, 10 locations, 10 role listings

-- ================================
-- TABLE CREATION
-- ================================

-- Drizzle migrations table
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
	id SERIAL PRIMARY KEY,
	hash text NOT NULL,
	created_at numeric
);

-- Event info table
CREATE TABLE IF NOT EXISTS "event_info" (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer,
	`error` text,
	`retries` integer DEFAULT 0
);

-- Data received table
CREATE TABLE IF NOT EXISTS "data_received" (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`html` text NOT NULL,
	`text` text NOT NULL,
	`received_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`processed` text DEFAULT 'false',
	`processing_notes` text
);

-- Role company table
CREATE TABLE IF NOT EXISTS "role_company" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);

-- Role state table
CREATE TABLE IF NOT EXISTS "role_state" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);

-- Role location table
CREATE TABLE IF NOT EXISTS "role_location" (
	`id` text PRIMARY KEY NOT NULL,
	`location_state` text NOT NULL,
	`city` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`location_state`) REFERENCES `role_state`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Role listing table
CREATE TABLE IF NOT EXISTS "role_listing" (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`work_arrangement` text DEFAULT 'on-site' NOT NULL,
	`captured_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	data_received_id TEXT REFERENCES data_received(id) ON DELETE SET NULL,
	`status` text DEFAULT 'not_applying' NOT NULL,
	`applied_at` integer,
	FOREIGN KEY (`company_id`) REFERENCES `role_company`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location`) REFERENCES `role_location`(`id`) ON UPDATE no action ON DELETE set null
);

-- Role qualifications table
CREATE TABLE IF NOT EXISTS "role_qualifications" (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Role callout table
CREATE TABLE IF NOT EXISTS "role_callout" (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Role attachment table
CREATE TABLE IF NOT EXISTS "role_attachment" (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`type` text NOT NULL,
	`path_or_url` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Role contact table
CREATE TABLE IF NOT EXISTS "role_contact" (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Role event table
CREATE TABLE IF NOT EXISTS "role_event" (
	id TEXT PRIMARY KEY NOT NULL,
	event_listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
	event_type TEXT NOT NULL,
	event_title TEXT NOT NULL,
	event_date INTEGER,
	event_notes TEXT
);

-- Settings table
CREATE TABLE IF NOT EXISTS "settings" (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL UNIQUE,
	value text NOT NULL,
	updated_at integer DEFAULT (strftime('%s','now')) NOT NULL
);

-- ================================
-- SEED DATA
-- ================================

-- Insert US states
INSERT OR IGNORE INTO role_state (id, name, abbreviation, created_at) VALUES
('839ef3ed-9675-4d2c-bb30-0fc264b1efe1', 'Alabama', 'AL', strftime('%s','now')),
('17a88b6a-8a4b-4f55-bfc3-cfceaad8e286', 'Alaska', 'AK', strftime('%s','now')),
('bb889ecc-b453-4ebc-a1bd-8f3fdb1eca48', 'Arizona', 'AZ', strftime('%s','now')),
('4290438a-9df1-44fd-9c94-ad22d36fadcc', 'Arkansas', 'AR', strftime('%s','now')),
('a4bace2a-8c6e-4095-a718-58113c1c8250', 'California', 'CA', strftime('%s','now')),
('9c641336-fe25-4e66-90b5-5de9bf44f99e', 'Colorado', 'CO', strftime('%s','now')),
('1823dc01-a1da-47c9-9127-27c79a061bcc', 'Connecticut', 'CT', strftime('%s','now')),
('be2d5bea-2ddf-4370-92d6-692da4fbe7eb', 'Delaware', 'DE', strftime('%s','now')),
('b9d1521d-9196-497d-99c5-e973c736a104', 'Florida', 'FL', strftime('%s','now')),
('2917e355-0b50-4ea3-b569-4a6ffcba65dd', 'Georgia', 'GA', strftime('%s','now'));

-- Insert 10 fake companies
INSERT INTO role_company (id, name, website, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'TechVision Solutions', 'https://techvision.example.com', strftime('%s','now')),
('c2222222-2222-2222-2222-222222222222', 'DataFlow Analytics', 'https://dataflow.example.com', strftime('%s','now')),
('c3333333-3333-3333-3333-333333333333', 'CloudScale Systems', 'https://cloudscale.example.com', strftime('%s','now')),
('c4444444-4444-4444-4444-444444444444', 'InnovateLabs', 'https://innovatelabs.example.com', strftime('%s','now')),
('c5555555-5555-5555-5555-555555555555', 'CyberGuard Security', 'https://cyberguard.example.com', strftime('%s','now')),
('c6666666-6666-6666-6666-666666666666', 'FinTech Global', 'https://fintechglobal.example.com', strftime('%s','now')),
('c7777777-7777-7777-7777-777777777777', 'HealthTech Innovations', 'https://healthtech.example.com', strftime('%s','now')),
('c8888888-8888-8888-8888-888888888888', 'DevOps Masters', 'https://devopsmasters.example.com', strftime('%s','now')),
('c9999999-9999-9999-9999-999999999999', 'AI Research Corp', 'https://airesearch.example.com', strftime('%s','now')),
('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quantum Computing Inc', 'https://quantumcomputing.example.com', strftime('%s','now'));

-- Insert 10 fake locations (using existing state IDs)
INSERT INTO role_location (id, location_state, city, created_at) VALUES
('l1111111-1111-1111-1111-111111111111', 'a4bace2a-8c6e-4095-a718-58113c1c8250', 'San Francisco', strftime('%s','now')),
('l2222222-2222-2222-2222-222222222222', 'a4bace2a-8c6e-4095-a718-58113c1c8250', 'Los Angeles', strftime('%s','now')),
('l3333333-3333-3333-3333-333333333333', '9c641336-fe25-4e66-90b5-5de9bf44f99e', 'Denver', strftime('%s','now')),
('l4444444-4444-4444-4444-444444444444', 'b9d1521d-9196-497d-99c5-e973c736a104', 'Miami', strftime('%s','now')),
('l5555555-5555-5555-5555-555555555555', '2917e355-0b50-4ea3-b569-4a6ffcba65dd', 'Atlanta', strftime('%s','now')),
('l6666666-6666-6666-6666-666666666666', 'bb889ecc-b453-4ebc-a1bd-8f3fdb1eca48', 'Phoenix', strftime('%s','now')),
('l7777777-7777-7777-7777-777777777777', '17a88b6a-8a4b-4f55-bfc3-cfceaad8e286', 'Anchorage', strftime('%s','now')),
('l8888888-8888-8888-8888-888888888888', '4290438a-9df1-44fd-9c94-ad22d36fadcc', 'Little Rock', strftime('%s','now')),
('l9999999-9999-9999-9999-999999999999', '1823dc01-a1da-47c9-9127-27c79a061bcc', 'Hartford', strftime('%s','now')),
('laaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'be2d5bea-2ddf-4370-92d6-692da4fbe7eb', 'Wilmington', strftime('%s','now'));

-- Insert 10 fake role listings
INSERT INTO role_listing (id, company_id, title, description, location, work_arrangement, captured_at, status, applied_at) VALUES
('r1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Senior Software Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">We are seeking a talented Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable backend services that power our cloud-native platform. This role offers the opportunity to work with cutting-edge technologies and solve complex distributed systems challenges.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">What You''ll Do:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Design, develop, and maintain high-performance microservices using modern languages and frameworks</li><li style="margin-bottom: 0.5rem;">Collaborate with cross-functional teams to define technical requirements and architecture</li><li style="margin-bottom: 0.5rem;">Write clean, maintainable, and well-tested code following best practices</li><li style="margin-bottom: 0.5rem;">Mentor junior engineers and contribute to engineering culture</li><li style="margin-bottom: 0.5rem;">Participate in code reviews, design reviews, and technical discussions</li><li style="margin-bottom: 0.5rem;">Troubleshoot and resolve production issues in a timely manner</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">5+ years of professional software development experience</li><li style="margin-bottom: 0.5rem;">Strong proficiency in Python, Java, or Go</li><li style="margin-bottom: 0.5rem;">Deep understanding of microservices architecture and RESTful API design</li><li style="margin-bottom: 0.5rem;">Experience with cloud platforms (AWS, GCP, or Azure)</li><li style="margin-bottom: 0.5rem;">Solid understanding of data structures, algorithms, and system design</li><li style="margin-bottom: 0.5rem;">Experience with relational and NoSQL databases</li><li style="margin-bottom: 0.5rem;">Excellent problem-solving and communication skills</li><li style="margin-bottom: 0.5rem;">Bachelor''s degree in Computer Science or equivalent experience</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Nice to Have:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Experience with Kubernetes and Docker</li><li style="margin-bottom: 0.5rem;">Knowledge of message queues (Kafka, RabbitMQ)</li><li style="margin-bottom: 0.5rem;">Experience with CI/CD pipelines</li><li style="margin-bottom: 0.5rem;">Open source contributions</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Benefits:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Competitive salary and equity package</li><li style="margin-bottom: 0.5rem;">Comprehensive health, dental, and vision insurance</li><li style="margin-bottom: 0.5rem;">401(k) with company match</li><li style="margin-bottom: 0.5rem;">Flexible PTO policy</li><li style="margin-bottom: 0.5rem;">Professional development budget</li><li style="margin-bottom: 0.5rem;">Hybrid work environment</li></ul></div>', 'l1111111-1111-1111-1111-111111111111', 'hybrid', strftime('%s','now') - 86400 * 5, 'not_applied', NULL),

('r2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Data Scientist', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Join our analytics team to build cutting-edge machine learning models that drive business insights and power data-driven decision making across the organization. You''ll work with petabytes of data and the latest ML technologies.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Responsibilities:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Develop and deploy machine learning models for prediction, classification, and recommendation systems</li><li style="margin-bottom: 0.5rem;">Perform exploratory data analysis to uncover insights and patterns</li><li style="margin-bottom: 0.5rem;">Design and implement data pipelines for model training and inference</li><li style="margin-bottom: 0.5rem;">Collaborate with product and engineering teams to integrate ML solutions</li><li style="margin-bottom: 0.5rem;">Monitor model performance and implement improvements</li><li style="margin-bottom: 0.5rem;">Present findings to stakeholders through compelling visualizations</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">MS or PhD in Computer Science, Statistics, Mathematics, or related field</li><li style="margin-bottom: 0.5rem;">3+ years of experience in data science or machine learning</li><li style="margin-bottom: 0.5rem;">Expert-level proficiency in Python and SQL</li><li style="margin-bottom: 0.5rem;">Deep knowledge of ML frameworks (TensorFlow, PyTorch, scikit-learn)</li><li style="margin-bottom: 0.5rem;">Experience with big data technologies (Spark, Hadoop)</li><li style="margin-bottom: 0.5rem;">Strong statistical and analytical thinking</li><li style="margin-bottom: 0.5rem;">Excellent communication skills for technical and non-technical audiences</li></ul></div>', 'l2222222-2222-2222-2222-222222222222', 'remote', strftime('%s','now') - 86400 * 12, 'not_applied', NULL),

('r3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'DevOps Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You''ll be responsible for automating deployments, ensuring system reliability, and enabling our engineering teams to ship code faster and more safely.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">What You''ll Do:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Design and implement infrastructure as code using Terraform and CloudFormation</li><li style="margin-bottom: 0.5rem;">Build and maintain CI/CD pipelines for multiple services</li><li style="margin-bottom: 0.5rem;">Manage Kubernetes clusters and containerized applications</li><li style="margin-bottom: 0.5rem;">Implement monitoring, logging, and alerting solutions</li><li style="margin-bottom: 0.5rem;">Optimize cloud costs and resource utilization</li><li style="margin-bottom: 0.5rem;">Respond to incidents and perform root cause analysis</li><li style="margin-bottom: 0.5rem;">Collaborate with development teams on deployment strategies</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">3+ years of experience in DevOps or Site Reliability Engineering</li><li style="margin-bottom: 0.5rem;">Strong experience with AWS, Azure, or GCP</li><li style="margin-bottom: 0.5rem;">Proficiency in Docker and Kubernetes</li><li style="margin-bottom: 0.5rem;">Strong scripting skills (Bash, Python, or Go)</li><li style="margin-bottom: 0.5rem;">Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)</li><li style="margin-bottom: 0.5rem;">Knowledge of infrastructure as code principles</li><li style="margin-bottom: 0.5rem;">Understanding of networking, security, and Linux systems</li></ul></div>', 'l3333333-3333-3333-3333-333333333333', 'hybrid', strftime('%s','now') - 86400 * 8, 'not_applied', NULL),

('r4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Full Stack Developer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">We need a creative Full Stack Developer to build innovative web applications that delight our users. You''ll own features end-to-end, from database design to pixel-perfect UI implementation.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Responsibilities:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Build responsive web applications using React and Node.js</li><li style="margin-bottom: 0.5rem;">Design and implement RESTful APIs and GraphQL endpoints</li><li style="margin-bottom: 0.5rem;">Create efficient database schemas and optimize queries</li><li style="margin-bottom: 0.5rem;">Write comprehensive unit and integration tests</li><li style="margin-bottom: 0.5rem;">Collaborate with designers to implement beautiful UIs</li><li style="margin-bottom: 0.5rem;">Debug issues across the full stack</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">4+ years of full stack development experience</li><li style="margin-bottom: 0.5rem;">Strong proficiency in React, TypeScript, and Node.js</li><li style="margin-bottom: 0.5rem;">Experience with both SQL and NoSQL databases</li><li style="margin-bottom: 0.5rem;">Knowledge of modern CSS frameworks and responsive design</li><li style="margin-bottom: 0.5rem;">Understanding of web performance optimization</li><li style="margin-bottom: 0.5rem;">Strong UI/UX sensibility</li><li style="margin-bottom: 0.5rem;">Excellent debugging and problem-solving skills</li></ul></div>', 'l4444444-4444-4444-4444-444444444444', 'on-site', strftime('%s','now') - 86400 * 20, 'not_applied', NULL),

('r5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'Security Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Join our security team to protect our systems and data from emerging threats. You''ll work on everything from security architecture to incident response, helping us maintain a strong security posture.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">What You''ll Do:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Conduct security assessments and penetration testing</li><li style="margin-bottom: 0.5rem;">Implement security controls and best practices</li><li style="margin-bottom: 0.5rem;">Monitor systems for security threats and vulnerabilities</li><li style="margin-bottom: 0.5rem;">Respond to security incidents and coordinate remediation</li><li style="margin-bottom: 0.5rem;">Develop security automation tools and scripts</li><li style="margin-bottom: 0.5rem;">Educate teams on security best practices</li><li style="margin-bottom: 0.5rem;">Maintain compliance with industry standards</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">3+ years of experience in cybersecurity</li><li style="margin-bottom: 0.5rem;">Knowledge of penetration testing tools and methodologies</li><li style="margin-bottom: 0.5rem;">Experience with security frameworks (NIST, ISO 27001, SOC 2)</li><li style="margin-bottom: 0.5rem;">Strong understanding of network protocols and encryption</li><li style="margin-bottom: 0.5rem;">Experience with cloud security (AWS, Azure, or GCP)</li><li style="margin-bottom: 0.5rem;">Relevant certifications (CISSP, CEH, OSCP) preferred</li></ul></div>', 'l5555555-5555-5555-5555-555555555555', 'hybrid', strftime('%s','now') - 86400 * 3, 'not_applied', NULL),

('r6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 'Frontend Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Looking for a Frontend Engineer passionate about creating beautiful user experiences. You''ll build responsive, accessible web applications that users love using modern frameworks and tools.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Responsibilities:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Build complex React applications with TypeScript</li><li style="margin-bottom: 0.5rem;">Implement pixel-perfect designs with attention to detail</li><li style="margin-bottom: 0.5rem;">Optimize application performance and bundle sizes</li><li style="margin-bottom: 0.5rem;">Ensure cross-browser compatibility and accessibility</li><li style="margin-bottom: 0.5rem;">Write maintainable CSS using modern methodologies</li><li style="margin-bottom: 0.5rem;">Collaborate with designers and backend engineers</li><li style="margin-bottom: 0.5rem;">Contribute to component libraries and design systems</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">4+ years of frontend development experience</li><li style="margin-bottom: 0.5rem;">Expert-level JavaScript and TypeScript</li><li style="margin-bottom: 0.5rem;">Deep React experience (hooks, context, performance optimization)</li><li style="margin-bottom: 0.5rem;">CSS/SASS proficiency and responsive design expertise</li><li style="margin-bottom: 0.5rem;">Experience with state management (Redux, Zustand, etc.)</li><li style="margin-bottom: 0.5rem;">Knowledge of web accessibility standards (WCAG)</li><li style="margin-bottom: 0.5rem;">Strong eye for design and user experience</li></ul></div>', 'l6666666-6666-6666-6666-666666666666', 'remote', strftime('%s','now') - 86400 * 15, 'not_applied', NULL),

('r7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 'Mobile Developer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Build next-generation healthcare mobile applications for iOS and Android. You''ll create intuitive mobile experiences that help patients and providers manage healthcare more effectively.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">What You''ll Do:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Develop cross-platform mobile applications using React Native</li><li style="margin-bottom: 0.5rem;">Implement complex UI components and animations</li><li style="margin-bottom: 0.5rem;">Integrate with RESTful APIs and handle offline scenarios</li><li style="margin-bottom: 0.5rem;">Optimize app performance and memory usage</li><li style="margin-bottom: 0.5rem;">Write automated tests for mobile applications</li><li style="margin-bottom: 0.5rem;">Debug issues on various devices and OS versions</li><li style="margin-bottom: 0.5rem;">Publish apps to App Store and Play Store</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">3+ years of mobile development experience</li><li style="margin-bottom: 0.5rem;">Strong React Native or Flutter experience</li><li style="margin-bottom: 0.5rem;">Published apps in App Store and/or Play Store</li><li style="margin-bottom: 0.5rem;">Understanding of mobile UI/UX patterns</li><li style="margin-bottom: 0.5rem;">Experience with mobile app deployment processes</li><li style="margin-bottom: 0.5rem;">Knowledge of platform-specific features (push notifications, camera, etc.)</li></ul></div>', 'l7777777-7777-7777-7777-777777777777', 'remote', strftime('%s','now') - 86400 * 7, 'not_applied', NULL),

('r8888888-8888-8888-8888-888888888888', 'c8888888-8888-8888-8888-888888888888', 'Site Reliability Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Help us maintain 99.99% uptime for our critical services. You''ll work on reliability, scalability, and performance of our infrastructure while building tools to make operations more efficient.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Responsibilities:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Monitor and maintain production systems</li><li style="margin-bottom: 0.5rem;">Implement and improve monitoring, logging, and alerting</li><li style="margin-bottom: 0.5rem;">Respond to incidents and conduct post-mortems</li><li style="margin-bottom: 0.5rem;">Automate operational tasks and runbooks</li><li style="margin-bottom: 0.5rem;">Capacity planning and performance optimization</li><li style="margin-bottom: 0.5rem;">Collaborate with development teams on reliability improvements</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">4+ years of SRE or operations experience</li><li style="margin-bottom: 0.5rem;">Strong Linux administration skills</li><li style="margin-bottom: 0.5rem;">Experience with monitoring tools (Prometheus, Grafana, Datadog)</li><li style="margin-bottom: 0.5rem;">Proficiency in Python, Go, or similar languages</li><li style="margin-bottom: 0.5rem;">Experience with incident response and on-call rotations</li><li style="margin-bottom: 0.5rem;">Knowledge of infrastructure as code</li><li style="margin-bottom: 0.5rem;">Strong troubleshooting and debugging skills</li></ul></div>', 'l8888888-8888-8888-8888-888888888888', 'hybrid', strftime('%s','now') - 86400 * 25, 'not_applied', NULL),

('r9999999-9999-9999-9999-999999999999', 'c9999999-9999-9999-9999-999999999999', 'Machine Learning Engineer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Work on cutting-edge AI research and production ML systems. You''ll train and deploy large-scale machine learning models that power our core products and serve millions of users.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">What You''ll Do:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Design and implement deep learning models for NLP and computer vision</li><li style="margin-bottom: 0.5rem;">Build scalable ML training pipelines</li><li style="margin-bottom: 0.5rem;">Optimize model performance and inference latency</li><li style="margin-bottom: 0.5rem;">Deploy models to production using MLOps best practices</li><li style="margin-bottom: 0.5rem;">Experiment with state-of-the-art ML techniques</li><li style="margin-bottom: 0.5rem;">Collaborate with researchers and product teams</li><li style="margin-bottom: 0.5rem;">Publish research findings at top-tier conferences</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">PhD in Computer Science, AI/ML, or related field (or equivalent experience)</li><li style="margin-bottom: 0.5rem;">3+ years of ML engineering experience</li><li style="margin-bottom: 0.5rem;">Deep expertise in TensorFlow or PyTorch</li><li style="margin-bottom: 0.5rem;">Strong mathematical background (linear algebra, statistics, optimization)</li><li style="margin-bottom: 0.5rem;">Experience training large-scale models</li><li style="margin-bottom: 0.5rem;">Publications in top ML conferences (NeurIPS, ICML, ICLR) a plus</li></ul></div>', 'l9999999-9999-9999-9999-999999999999', 'on-site', strftime('%s','now') - 86400 * 10, 'not_applied', NULL),

('raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quantum Software Developer', '<h2 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">About the job</h2><div><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Overview:</strong></p><p style="margin-bottom: 1rem;">Pioneer the future of quantum computing software development. You''ll design quantum algorithms and build software tools for the next generation of computing platforms.</p><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Responsibilities:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">Develop quantum algorithms for optimization and simulation problems</li><li style="margin-bottom: 0.5rem;">Implement quantum circuits using Q#, Qiskit, or Cirq</li><li style="margin-bottom: 0.5rem;">Build quantum software development tools and libraries</li><li style="margin-bottom: 0.5rem;">Collaborate with physicists and quantum hardware teams</li><li style="margin-bottom: 0.5rem;">Benchmark quantum algorithms on simulators and real hardware</li><li style="margin-bottom: 0.5rem;">Research error mitigation techniques</li><li style="margin-bottom: 0.5rem;">Contribute to quantum computing education and outreach</li></ul><p style="margin-bottom: 1rem;"><strong style="font-weight: bold;">Requirements:</strong></p><ul style="margin-bottom: 1rem;"><li style="margin-bottom: 0.5rem;">MS or PhD in Physics, Computer Science, or related field</li><li style="margin-bottom: 0.5rem;">Background in quantum mechanics or quantum computing</li><li style="margin-bottom: 0.5rem;">Programming experience in Python, Q#, or similar languages</li><li style="margin-bottom: 0.5rem;">Knowledge of quantum algorithms (Shor''s, Grover''s, VQE, QAOA)</li><li style="margin-bottom: 0.5rem;">Strong theoretical computer science background</li><li style="margin-bottom: 0.5rem;">Experience with quantum computing frameworks</li><li style="margin-bottom: 0.5rem;">Passion for cutting-edge technology</li></ul></div>', 'laaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'on-site', strftime('%s','now') - 86400 * 2, 'not_applied', NULL);

-- Insert fake role_events for various listings
INSERT INTO role_event (id, event_listing_id, event_type, event_title, event_date, event_notes) VALUES
-- Events for Senior Software Engineer (r1111111...)
('e1111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'Application', 'Submitted Application', strftime('%s','now') - 86400 * 4, 'Applied through company website. Received confirmation email.'),
('e1111112-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'Email', 'Recruiter Response', strftime('%s','now') - 86400 * 3, 'Recruiter reached out to schedule phone screen.'),
('e1111113-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'Interview', 'Phone Screen', strftime('%s','now') - 86400 * 2, 'Spoke with recruiter for 30 minutes. Discussed background and role requirements.'),

-- Events for Data Scientist (r2222222...)
('e2222221-2222-2222-2222-222222222222', 'r2222222-2222-2222-2222-222222222222', 'Application', 'Applied via LinkedIn', strftime('%s','now') - 86400 * 11, 'Quick apply through LinkedIn. No response yet.'),

-- Events for DevOps Engineer (r3333333...)
('e3333331-3333-3333-3333-333333333333', 'r3333333-3333-3333-3333-333333333333', 'Application', 'Application Submitted', strftime('%s','now') - 86400 * 6, 'Submitted resume and cover letter through ATS.'),
('e3333332-3333-3333-3333-333333333333', 'r3333333-3333-3333-3333-333333333333', 'Interview', 'Technical Screen', strftime('%s','now') - 86400 * 1, 'Completed live coding challenge. Built CI/CD pipeline demo.'),

-- Events for Full Stack Developer (r4444444...)
('e4444441-4444-4444-4444-444444444444', 'r4444444-4444-4444-4444-444444444444', 'Email', 'Inquiry Email Sent', strftime('%s','now') - 86400 * 18, 'Reached out to hiring manager on LinkedIn.'),
('e4444442-4444-4444-4444-444444444444', 'r4444444-4444-4444-4444-444444444444', 'Email', 'Response Received', strftime('%s','now') - 86400 * 15, 'Hiring manager replied. Encouraged me to apply.'),

-- Events for Security Engineer (r5555555...)
('e5555551-5555-5555-5555-555555555555', 'r5555555-5555-5555-5555-555555555555', 'Interview', 'Initial Interview', strftime('%s','now') + 86400 * 2, 'Scheduled for Friday at 2pm. Video call with security team lead.'),

-- Events for Frontend Engineer (r6666666...)
('e6666661-6666-6666-6666-666666666666', 'r6666666-6666-6666-6666-666666666666', 'Application', 'Applied', strftime('%s','now') - 86400 * 14, 'Applied through company careers page.'),
('e6666662-6666-6666-6666-666666666666', 'r6666666-6666-6666-6666-666666666666', 'Rejection', 'Position Filled', strftime('%s','now') - 86400 * 8, 'Received rejection email. Position filled by internal candidate.'),

-- Events for Mobile Developer (r7777777...)
('e7777771-7777-7777-7777-777777777777', 'r7777777-7777-7777-7777-777777777777', 'Phone Call', 'Recruiter Call', strftime('%s','now') - 86400 * 5, 'Initial call with recruiter. Discussed salary expectations and timeline.'),
('e7777772-7777-7777-7777-777777777777', 'r7777777-7777-7777-7777-777777777777', 'Interview', 'Hiring Manager Interview', strftime('%s','now') - 86400 * 3, 'Video call with hiring manager. Reviewed portfolio and past projects.'),
('e7777773-7777-7777-7777-777777777777', 'r7777777-7777-7777-7777-777777777777', 'Interview', 'Technical Round', strftime('%s','now') + 86400 * 1, 'Upcoming: React Native coding challenge scheduled.'),

-- Events for Site Reliability Engineer (r8888888...)
('e8888881-8888-8888-8888-888888888888', 'r8888888-8888-8888-8888-888888888888', 'Instant Message', 'LinkedIn Message', strftime('%s','now') - 86400 * 23, 'Recruiter reached out via LinkedIn InMail.'),

-- Events for Machine Learning Engineer (r9999999...)
('e9999991-9999-9999-9999-999999999999', 'r9999999-9999-9999-9999-999999999999', 'Application', 'Application Submitted', strftime('%s','now') - 86400 * 9, 'Applied with research portfolio and GitHub profile.'),
('e9999992-9999-9999-9999-999999999999', 'r9999999-9999-9999-9999-999999999999', 'Interview', 'Research Presentation', strftime('%s','now') - 86400 * 5, 'Presented past ML research to the team. Discussed model architecture.'),
('e9999993-9999-9999-9999-999999999999', 'r9999999-9999-9999-9999-999999999999', 'Offer', 'Offer Received', strftime('%s','now') - 86400 * 2, 'Received verbal offer! Waiting for written offer letter.'),

-- Events for Quantum Software Developer (raaaaaaa...)
('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Not Applying', 'Not Interested', strftime('%s','now') - 86400 * 1, 'Decided not to pursue. Position requires on-site relocation.'),
('eaaaaaab-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Application', 'Application Submitted', strftime('%s','now') - 86400 * 9, 'Applied with research portfolio and GitHub profile.'),
('eaaaaaac-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Interview', 'Research Presentation', strftime('%s','now') - 86400 * 5, 'Presented past ML research to the team. Discussed model architecture.');
