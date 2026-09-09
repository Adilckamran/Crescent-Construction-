import React from 'react'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Services from '../components/Services'
import WhyUs from '../components/WhyUs'
import Projects from '../components/Projects'
import Process from '../components/Process'
import Waterproofing from '../components/Waterproofing'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import ContactCTA from '../components/ContactCTA'
import Contact from '../components/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <WhyUs />
      <Projects />
      <Process />
      <Waterproofing />
      <Testimonials />
      <FAQ />
      <ContactCTA />
      <Contact />
    </>
  )
}
