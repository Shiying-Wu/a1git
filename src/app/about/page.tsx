// "About Page"
// layout ref: https://linear.app/changelog/2025-08-14-product-intelligence-technology-preview

import {Session} from 'inspector/promises';


// <></> fragement wraps more then one element in return cluse

/* export default function About(){
    return (
        <>
        <h1>How to use </h1>
        <p>
            Developing in a team environment is hard. Coordinating Git commits, updating project boards, and managing a shared repository creates significant manual overhead that distracts from actual learning and coding.
        </p>
        <video width="320" height="240" controls>
            <source src="#" type="video/mp4"/>
        </video>
        </>
    )
}
 */


const About=()=>{
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
                    <source src="#" type="video/mp4" />
                </video>
            </section>
        </main>
    )
};

export default About;






