import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';


const AboutPage = () => {
const tattooImages = ["tattoopray.jpg", "tat-2.jpg", "tat-3.jpg", "customsnake.JPG", "tat-5.jpg"]
const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        window.scrollTo(0, 0);

        // Simulate a delay for loading
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(delay);
      }, []); 


  return (

    
    <div className="about-container">
      
      <header className="about-header">
        <h1>ABOUT</h1>
        <section className="about-caption">
        {/* <p>A curated digital sanctuary merging art and technology, illuminating the path to wholeness and growth</p> */}
        <p>CURATED DIGITAL SANCTUARY: ART + TECHNOLOGY | PATH TO WHOLENESS & GROWTH</p>
        </section>
      </header>

      <section className="about-row-1">
        <section className="introduction">
        <h2>THE CREATIVE</h2>
        <img src="/images/cropheadshot.jpg" alt="selfportrait"/>
        <p>Hey, I'm Daniel Nelson, the creator behind SOLUS CORE. My journey began at Parsons School of Art & Design, where I honed skills in art, graphic design, and creative technology. Seeking further growth, I became experienced in full-stack software engineering at The Marcy Lab School's Software Engineering Fellowship. SOLUS CORE, born from this diverse background, is a platform I've crafted to showcase my multifaceted portfolio, delving into the intricacies of the human condition. As an artist, graphic designer, and software engineer, I leverage my varied expertise to offer insights and create pathways for navigating the complexities of morality, existence, and the pursuit of personal wholeness.
        </p>
        </section>
        <section className="philosophy-inspiration-container">
            <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <section className="artistic-philosophy">
        <h2>THE PHILOSOPHY</h2>
        <p>
        Within SOLUS CORE, I aim to shed light on the transformative journey towards personal wholeness, capturing the beauty of introspection and embracing the profound depth of the human experience. Drawing inspiration from philosophical luminaries such as Fyodor Dostoevsky, Friedrich Nietzsche, Albert Camus, Arthur Schopenhauer, and Miyamoto Musashi, each creation unravels the complexities of the human experience. This exploration highlights individualism and transformative stories, connecting philosophical ideas with personal and cultural experiences.
        </p>
        <p>Spanning immersive websites to evocative multimedia paintings and drawings, my creations merge fine arts, graphic design, and technology. SOLUS CORE aims to connect with you on a profound level, sparking introspection and inviting you to delve into the depth into its meaning. Each piece serves as a portal into existential themes—absurdism, nihilism, and existentialism—inviting you to contemplate the depth of the human experience and infuse its meaning with your unique interpretation and engagement.    </p> 
        
        
        <section className="skills-container">
  <div className='skills-header'>
  <h2>Skills</h2>
  <p>*Skills extend beyond the showcased</p>
  </div>
  <div className="skills-list">
    <div className="skill-category">
      <p>Product Management</p>
      <p>UI/UX Design</p>
      <p>Agile Development</p>
      <p>Fine Arts</p>
      <p>Adobe Photoshop</p>
      <p>Adobe Illustrator</p>
      <p>Full-Stack Development</p>
      <p>Object-Oriented Programming</p>
      <p>Javascript</p>
      <p>TypeScript</p>
      <p>Python</p>
      <p>React</p>
      <p>SQL</p>
      <p>Git</p>
      <p>AWS</p>
      <p>Node.js</p>
      <p>Application Programming Interfaces</p>
      <p>Postgres</p>
      <p>Graphic Design</p>
      <p>CSS</p>
      <p>HTML</p>
      <p>Wireframing</p>
      <p>Figma</p>
      <p>Computer-Aided Design</p>
      <p>Client Relations</p>
      <p>Problem Solving</p>
      <p>Attention to Detail</p>
      <p>Collaborative Leadership</p>
    </div>
  </div>
</section>

      </section>
      </section>
      
      </section>
      <section className="about-row-2">
        <section className="beyond-the-canvas-image-container">
        <div className="beyond-column">
        <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <h2>Beyond the Canvas</h2>
        <p>
        My journey extends beyond traditional means of art and design, driven by a passion for impactful software projects like Second Wind and CareerSpring's Interest Finder feature. I believe that technology has the power to address real-world challenges and provide tangible solutions.
        <br /><br />
        This commitment stems from a belief in technology’s ability to support personal growth and navigate complex problems. Each line of code and project is designed to empower individuals, helping them face their paths with courage and resilience. This vision, in harmony with the themes of SOLUS CORE, seeks to make technology a transformative force, illuminating our collective journey and offering direction in challenging times. </p>
        </div>
        <div className='image-with-description-container'>
        <div className="image-with-description-v1">
        
        <img src="/images/secondwind.jpg" alt="desc"/>
        <p>
        Second Wind, a full stack online community-based platform that provide resources, support, and employment for those impacted by the criminal justice system.   </p>
        </div>
        <div className="image-with-description-v1">
        
        <Link to="https://interestfinder.careerspring.org/?page_id=2" target="_blank" className="image-with-description-v1">
  <img src="/images/careerspring.jpg" alt="desc" />
</Link>
<p className="image-text-2">As a Developer Contractor, I’ve been instrumental in developing software like CareerSpring’s Career Interest Profiler by leveraging JavaScript, HTML & CSS. This custom career assessment tool seamlessly integrated into WordPress serves as a beacon for individuals exploring their professional paths.
  <br></br>
  <br></br>
   *Click on to try out the tool for yourself.</p>
        </div>
        <div className="image-with-description-v1">
        <img src="/images/SAP.JPG" alt="desc"/>
        <p className="image-text-3">SAP (FORTHESOUL), represents a convergence of 3D modeling with AutoCAD, incorporating components such as a PIR motion sensor, DFPlayer, SD card, jumper wires, and Arduino Uno. Within the intricate model, the sculpture delivers a spoken narrative drawn from a fusion of written words by Jean-Paul Sartre, Albert Camus, and my own alterations through text-to-speech software.
        </p>
        </div>
        <div className="image-with-description-v1">
        <Link to="https://danielnelson37.github.io/METVoyager/" target="_blank" className="image-with-description-v1">
        <img src="/images/metvoyager.jpg" alt="desc" className="metvid" />
        </Link>
        <p className="image-text-4">METVoyager is a web platform I developed that leverages the MET API to deliver artwork recommendations based on search functionality or by selecting specific categories to generate art that matches. The platform also allows users to save and revisit favorite artworks in their own personal gallery. 
        <br></br>
        <br></br>
          *Click on to try out the tool for yourself.</p>
        </div>
        </div>
       
        </section>
       
      </section>
    
      <section className="about-row-3">
      <section className="upcoming-projects">
      <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <div className="upcoming-projects-text-section">
          
        <h2>Projects in Progress</h2>
        <p>*Hover over to learn more about. Not limited to the showcased.</p>
        </div>
        <div className="upcoming-projects-column-2">
        <div className="image-with-description" id="chrome-container" >
      <video autoPlay muted width="auto" loop playsInline controls={false}>
            <source src='/videos/HCteaser.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
      <div className='chrome-text'>
      <p>A pyschological neoo noir thriller unfolds in "Heart in Chrome," a graphic novel currently in the throes of creation exploring the nexus of art, technology, identity, and power.
      <br /><br /> 
      * You can now check out some concept designs for Heart in Chrome in the Archive section!</p>
      </div>
    </div>
    
    <div className="image-with-description" id="tats">
    <div className="tattoo-text">
    <p> As my journey unfolds, I aim to use tattooing as another layer of my creative odyssey to explore different ways to connect art with personal experiences and cultural influences.
    <br /><br />
       *You can find more designs and practice in the Archive section!</p>
    </div>
    <div className="tattoo-mini-gallery">
      <div className='image-column-1'>
      <img src = {`/images/${tattooImages[0]}`} alt= {"tat-0"} />
      </div>
      <div className='image-column-2'>
      {/* <img src = {`/images/${tattooImages[4]}`} alt= {"tat-4"} /> */}
      <img src = {`/images/${tattooImages[3]}`} alt= {"tat-3"} />
      </div>  
    </div>
    </div>
    </div>
      </section>
      </section>

      <section className="contact-container">
        <div className='contact-img'>
          <video className="contact-image" autoPlay muted width="auto" loop playsInline controls={false}>
            <source src='/videos/skull.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
      </div>
      <div className='contact-information-container'>
        <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <h2>Contact Information</h2>
        <p>
          Connect with me on social media, explore my portfolio, or reach out via email. I'd love to hear your thoughts and insights.
        </p>
        <p>
         <a href="mailto:your.email@example.com">lukannelson@gmail.com</a>
        </p>
        <div className="social-media-row">
                <div className="social-media-links">
                    <a href="https://www.instagram.com/dan.da.solo/" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faInstagram} size="2x" />
                    </a>
                    <a href="https://github.com/danielnelson37" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faGithub} size="2x" />
                    </a>
                    <a href="https://medium.com/@lukannelson" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faMedium} size="2x" />
                    </a>
                    <a href="https://www.linkedin.com/in/dnelson777" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faLinkedin} size="2x" />
                    </a>
                </div>
            </div>
            </div>
           
      </section>
    </div>
  );
};

export default AboutPage;
