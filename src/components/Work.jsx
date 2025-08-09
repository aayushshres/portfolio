import React from 'react'

// Components
import ProjectCard from './ProjectCard'

const works = [
    {
        imgSrc: '/images/groovythumbnail.png',
        title: 'Groovy',
        tags: ['Mobile App', 'Flutter'],
        projectLink: 'https://github.com/aayushshres/Groovy.git'
    },
    {
        imgSrc: '/images/hoodsterthumbnail.png',
        title: 'Hoodster',
        tags: ['Web App', 'MERN'],
        projectLink: 'https://github.com/aayushshres/hoodster-frontend.git'
    },
    {
        imgSrc: '/images/pixeladventurethumbnail.png',
        title: 'Pixel Adventure',
        tags: ['Mobile Game', 'Flutter'],
        projectLink: 'https://github.com/aayushshres/pixel-adventure.git'
    },
    {
        imgSrc: '/images/dashblogthumbnail.png',
        title: 'Dash Blog',
        tags: ['Mobile App', 'Flutter'],
        projectLink: 'https://github.com/aayushshres/Dash-Blog.git'
    },
    {
        imgSrc: '/images/noobvimthumbnail.png',
        title: 'Noob Vim',
        tags: ['CLI', 'Lua'],
        projectLink: 'https://github.com/aayushshres/Noobvim.git'
    },
    {
        imgSrc: '/images/hisabkitabthumbnail.png',
        title: 'Hisabkitab',
        tags: ['Mobile App', 'Flutter'],
        projectLink: 'https://github.com/aayushshres/Hisabkitab.git'
    },
];

const Work = () => {
    return (
        <section
            id="work"
            className="section">
            <div className="container">
                <h2 className="headline-2 mb-8 reveal-up">
                    My Portfolio Highlights
                </h2>

                <div className="grid gap-x-4 gap-y-5 grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))]">
                    {works.map(({ imgSrc, title, tags, projectLink }, key) => (
                        <ProjectCard
                            key={key}
                            imgSrc={imgSrc}
                            title={title}
                            tags={tags}
                            projectLink={projectLink}
                            classes="reveal-up"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Work