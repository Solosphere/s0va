import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ProjectCarousel = ({ products, getProtectedImageUrl }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const projects = [
    {
      id: 1,
      image: "secondwind.webp",
      title: "Second Wind",
      description: "Second Wind, a full stack online community-based platform that provide resources, support, and employment for those impacted by the criminal justice system.",
      link: null
    },
    {
      id: 2,
      image: "careerspring.webp",
      title: "CareerSpring Interest Finder",
      description: "As a Developer Contractor, I've been instrumental in developing software like CareerSpring's Career Interest Profiler by leveraging JavaScript, HTML & CSS. This custom career assessment tool seamlessly integrated into WordPress serves as a beacon for individuals exploring their professional paths. *Click on to try out the tool for yourself.",
      link: "https://interestfinder.careerspring.org/?page_id=2"
    },
    {
      id: 3,
      image: "SAP.webp",
      title: "SAP (FORTHESOUL)",
      description: "SAP (FORTHESOUL), represents a convergence of 3D modeling with AutoCAD, incorporating components such as a PIR motion sensor, DFPlayer, SD card, jumper wires, and Arduino Uno. Within the intricate model, the sculpture delivers a spoken narrative drawn from a fusion of written words by Jean-Paul Sartre, Albert Camus, and my own alterations through text-to-speech software.",
      link: null
    },
    {
      id: 4,
      image: "metvoyager.webp",
      title: "METVoyager",
      description: "METVoyager is a web platform I developed that leverages the MET API to deliver artwork recommendations based on search functionality or by selecting specific categories to generate art that matches. The platform also allows users to save and revisit favorite artworks in their own personal gallery. *Click on to try out the tool for yourself.",
      link: "https://danielnelson37.github.io/METVoyager/"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="project-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{
            transform: `translateX(-${currentSlide * (100 / projects.length)}%)`,
            width: `${projects.length * 100}%`,
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className="carousel-slide"
              style={{ width: `${100 / projects.length}%` }}
            >
              <div className="image-with-description-v1">
                {project.link ? (
                  <Link to={project.link} target="_blank" className="project-link">
                    <img 
                      src={getProtectedImageUrl(project.image, products)} 
                      loading="lazy" 
                      alt={project.title}
                    />
                  </Link>
                ) : (
                  <img 
                    src={getProtectedImageUrl(project.image, products)} 
                    loading="lazy" 
                    alt={project.title}
                  />
                )}
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        className="carousel-nav carousel-prev" 
        onClick={prevSlide}
        aria-label="Previous project"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button 
        className="carousel-nav carousel-next" 
        onClick={nextSlide}
        aria-label="Next project"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {projects.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCarousel; 