import { Session } from 'inspector/promises';
import DockerGenerator from '../Components/DockerGenerator';

export default function Page() {
    return (
        <main className="main-content">
            <section className="centered-heading"><h1>Dockerize your Next.js App</h1></section>
            <DockerGenerator />
        </main>
    );
}