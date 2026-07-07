import React from 'react';
import Coverflow from './Coverflow';
import { toLogCard } from '../data/caseStudies';

const ProjectCarousel = ({ products, getProtectedImageUrl }) => {
  // Short captions fit the smaller mobile/tablet cards; the full descriptions
  // are restored on desktop, where the taller caption area has room for them.
  const projects = [
    {
      id: 1,
      image: "secondwind.webp",
      title: "Second Wind",
      material: "Web Development",
      year: 2023,
      description: "Full-stack platform connecting people impacted by the justice system to resources, support, and employment.",
      descriptionFull: "Second Wind, a full stack online community-based platform that provides resources, support, and employment for those impacted by the criminal justice system."
    },
    {
      id: 2,
      image: "careerspring.webp",
      title: "CareerSpring Interest Finder",
      material: "Web Development",
      year: 2023,
      description: "A custom WordPress career-interest assessment tool built with JavaScript, HTML & CSS to help people map their professional paths.",
      descriptionFull: "As a Developer Contractor, I've been instrumental in developing software like CareerSpring's Career Interest Profiler by leveraging JavaScript, HTML & CSS. This custom career assessment tool, seamlessly integrated into WordPress, serves as a beacon for individuals exploring their professional paths."
    },
    {
      id: 3,
      image: "SAP.webp",
      title: "SAP (FORTHESOUL)",
      material: "Creative Technology",
      year: 2022,
      description: "An Arduino-powered sculpture that speaks an existential narrative drawn from Sartre, Camus, and my own words.",
      descriptionFull: "SAP (FORTHESOUL) represents a convergence of 3D modeling with AutoCAD, incorporating components such as a PIR motion sensor, DFPlayer, SD card, jumper wires, and Arduino Uno. Within the intricate model, the sculpture delivers a spoken narrative drawn from a fusion of written words by Jean-Paul Sartre, Albert Camus, and my own alterations through text-to-speech software."
    },
    {
      id: 4,
      image: "metvoyager.webp",
      title: "METVoyager",
      material: "Web Development",
      year: 2023,
      description: "A web app that taps the MET API to recommend artworks and save favorites to a personal gallery.",
      descriptionFull: "METVoyager is a web platform I developed that leverages the MET API to deliver artwork recommendations based on search functionality or by selecting specific categories to generate matching art. The platform also lets users save and revisit favorite artworks in their own personal gallery."
    }
  ];

  // Map a carousel image to its piece on the site, so each card opens that
  // work's detail page — the same behavior as the home mini-gallery.
  const findProductId = (image) =>
    (Array.isArray(products)
      ? products.find((p) => p.image && p.image.some((img) => img.includes(image)))
      : null)?.id ?? null;

  const items = projects.map((p) => {
    const detailId = findProductId(p.image);
    return {
      key: p.id,
      image: p.image,
      to: detailId ? `/gallery/${detailId}` : null,
      title: p.title,
      meta: `${p.material} · ${p.year}`,
      description: p.description,
      descriptionFull: p.descriptionFull,
    };
  });

  // Drop an engineering case study (terminal card) in among the project works.
  const logCard = toLogCard('ec2-reboot-alerting');
  if (logCard) items.splice(2, 0, logCard);

  return (
    <Coverflow
      items={items}
      getImageUrl={(img) => getProtectedImageUrl(img, products)}
      showCaption
      onNavigate={() => sessionStorage.setItem('aboutReturn', 'carousel')}
    />
  );
};

export default ProjectCarousel;
