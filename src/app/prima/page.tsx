import { Session } from 'inspector/promises';
import DBGenerator from '../Components/DBGenerator';


export default function(){
    return(
        <main className="main-content">
          <section className="centered-heading"><h1>Database Generator (Prisma / Sequelize)</h1></section>
          <DBGenerator />
        </main>
    )
}