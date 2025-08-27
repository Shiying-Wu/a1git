const About = () => {
    return(
        <main className="main-content">
            <section className="centered-heading">
                <h1>How to use</h1>
            </section>

            <section className="aligned-description">
                <p>Developing in a team environment is hard. Coordinating Git commits, updating project boards, and managing a shared repository creates significant manual overhead that distracts from actual learning and coding.</p>
            </section>

            <section className="video-section">
                <video width="640" height="600" controls>
                    <source src="/a1git-introduction-480.mov" />
                </video>
            </section>
        </main>
    )
};

export default About;

