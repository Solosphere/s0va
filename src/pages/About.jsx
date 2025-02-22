import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';


const AboutPage = () => {
const tattooImages = ["tattoopray.webp", "tat-2.webp", "tat-3.webp", "customsnake.webp"]
const [loading, setLoading] = useState(true);
const [typedText, setTypedText] = useState('');
// const binaryString = "01111001 01101111 01110101 00100000 01100011 01100001 01101110 01110100 00100000 01101011 01101001 01101100 01101100 00100000 01101101 01100101 00100000 01001001 01101101 00100000 01111010 01100101 01110010 01101111 01110011 00100000 01100001 01101110 01100100 00100000 01101111 01101110 01100101 01110011 00001010 ";
const [isSliding, setIsSliding] = useState(false);




    useEffect(() => {
        window.scrollTo(0, 0);
        // Simulate a delay for loading
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(delay);
      }, []); 


      useEffect(() => {
        const text = "$ echo '01001000 01100101 01110010 01100101 00101100 00100000 01001001 00100000 01100001 01101101 00100000 01101001 01101110 01100110 01101001 01101110 01101001 01110100 01100101 00101110 00100000 01011001 01101111 01110101 00100000 01100011 01100001 01101110 00100111 01110100 00100000 01101011 01101001 01101100 01101100 00100000 01101101 01100101 00100000 01001001 00100111 01101101 00100000 01111010 01100101 01110010 01101111 01110011 00100000 01100001 01101110 01100100 00100000 01101111 01101110 01100101 01110011 00101110 00001010'"; 
        let index = 0;
    
        const interval = setInterval(() => {
          setTypedText((prev) => prev + text[index]);
          index++;      
    }, 50); // Typing speed
    
        return () => clearInterval(interval);
      }, []);

  return (
    <div className="about-container">
      
      <header className="about-header">
        <h1>ABOUT</h1>
        <section className="about-caption">
        {/* <p>A curated digital sanctuary merging art and technology, illuminating the path to wholeness and growth</p> */}
        <p>{typedText}</p>
        </section>
      </header>

      <section className="about-row-1">
        <section className="introduction">
        <h2>THE CREATIVE</h2>
        <img src="/images/cropheadshot.webp" loading="lazy" alt="selfportrait"/>
        <p>Hey, I'm Daniel Nelson, the creator behind SOLUS CORE. My journey began at Parsons School of Art & Design, where I honed skills in art, graphic design, and creative technology. Seeking further growth, I became experienced in full-stack software engineering at The Marcy Lab School's Software Engineering Fellowship. SOLUS CORE, born from this diverse background, is a platform I've crafted to showcase my multifaceted portfolio, delving into the intricacies of the human condition. As an artist, graphic designer, and software engineer, I leverage my varied expertise to offer insights and create pathways for navigating the complexities of morality, existence, and humanity.
        </p>
        </section>
        <section className="philosophy-inspiration-container">
            <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <section className="artistic-philosophy">
        <h2>THE PHILOSOPHY</h2>
        <p>SOLUS CORE is my way of leaving a piece of myself within the machine—a space where my work exists on its own, independent of an intended audience (unless rooted in code). Inspired by thinkers like Dostoevsky, Camus, Schopenhauer, and Musashi, my creations explore individualism, transformation, and the human condition. Through code, multimedia paintings, and graphic design, I merge fine art with technology, weaving existential themes—absurdism, nihilism, and existentialism—into experiences open to being encountered, absorbed, and interpreted freely.
        </p> 
        
        
        <section className="skills-container">
  <div className='skills-header'>
  <h2>Skills</h2>
  <p>*Skills extend beyond the showcased</p>
  </div>
  <div className="skills-list">
    <div className="skill-category">
      <p>Cloud Computing</p>
      <p>Platform Engineering</p>
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
        
        <img src="/images/secondwind.webp" loading="lazy" alt="desc"/>
        <p>
        Second Wind, a full stack online community-based platform that provide resources, support, and employment for those impacted by the criminal justice system.   </p>
        </div>
        <div className="image-with-description-v1">
        
        <Link to="https://interestfinder.careerspring.org/?page_id=2" target="_blank" className="image-with-description-v1">
  <img src="/images/careerspring.webp" loading="lazy" alt="desc" />
</Link>
<p className="image-text-2">As a Developer Contractor, I’ve been instrumental in developing software like CareerSpring’s Career Interest Profiler by leveraging JavaScript, HTML & CSS. This custom career assessment tool seamlessly integrated into WordPress serves as a beacon for individuals exploring their professional paths.
  <br></br>
  <br></br>
   *Click on to try out the tool for yourself.</p>
        </div>
        <div className="image-with-description-v1">
        <img src="/images/SAP.webp" loading="lazy" alt="desc"/>
        <p className="image-text-3">SAP (FORTHESOUL), represents a convergence of 3D modeling with AutoCAD, incorporating components such as a PIR motion sensor, DFPlayer, SD card, jumper wires, and Arduino Uno. Within the intricate model, the sculpture delivers a spoken narrative drawn from a fusion of written words by Jean-Paul Sartre, Albert Camus, and my own alterations through text-to-speech software.
        </p>
        </div>
        <div className="image-with-description-v1">
        <Link to="https://danielnelson37.github.io/METVoyager/" target="_blank" className="image-with-description-v1">
        <img src="/images/metvoyager.webp" loading="lazy" alt="desc" className="metvid" />
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
      <p>A psychological neo-noir thriller unfolds in <i>Heart in Chrome</i>, a graphic novel currently in the throes of creation, exploring the nexus of art, technology, identity, and power.
      <br /><br /> 
      * You can now check out some concept designs for <i>Heart in Chrome</i> in the Archive section!</p>
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
