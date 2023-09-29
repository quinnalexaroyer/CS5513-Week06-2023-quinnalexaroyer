import Layout from '../../components/layout';
import {getAllIDs, getData} from '../../lib/data-firebase';

export async function getStaticProps({params}) {
  const it = await getData(params.id);
  return {
    props: {
      it
    }
  };
}

export async function getStaticPaths() {
  const paths = await getAllIDs();
  return {paths, fallback:false};
}

function abs(x) {
  if(x < 0) return -x;
  else return x;
}

export default function Entry( {it} ) {
  return (
    <Layout>
      <article className="presidentInfo">
        <h2>{it.name}</h2>
        <table>
          <tr><td>Rank</td><td>{it.rank}</td></tr>
          <tr><td>Date of birth</td><td>{it.birth}</td></tr>
          <tr><td>Date of death</td><td>{it.death}</td></tr>
          <tr><td>Start of term</td><td>{it.start}</td></tr>
          <tr><td>End of term</td><td>{it.end}</td></tr>
          <tr><td>Party</td>
            <td><a href={`/party/${it.party}`}>{it.party}</a></td>
          </tr>
          <tr><td>Predecessor</td><td>{it.prevName}</td></tr>
          <tr><td>Successor</td><td>{it.nextName}</td></tr>
        </table>
      </article>
    </Layout>
  );
}