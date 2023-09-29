import Layout from '../components/layout';
import Link from 'next/link';
import { getSortedList } from '../lib/data-firebase';

export async function getStaticProps() {
  const presidentsData = await getSortedList();
  return {props: {presidentsData}};
}

export default function Home({presidentsData}) {
  return (
    <Layout home>
      <div id="listOfPresidents" className="list-group">
        {presidentsData && presidentsData.map(
          ({params}) => (
            <Link key={params.id} href={`/presidents/${params.id}`} className="list-group-item list-group-item-action">
              {params.name}
            </Link>
          )
        )}
      </div>
    </Layout>
  );
}