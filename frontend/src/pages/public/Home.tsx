import Container from '../../components/Container';
import HeroSlideshow from '../../components/user/HeroSlideshow';
import NotVerified from '../../components/user/NotVerified';
import TopRatedDocumentary from '../../components/user/TopRatedDocumentary';
import TopRatedMovies from '../../components/user/TopRatedMovies';
import TopRatedTVSeries from '../../components/user/TopRatedTVSeries';
import TopRatedWebSeries from '../../components/user/TopRatedWebSeries';
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-primary">
      <Container className="px-2 xl:p-0">
        <NotVerified />
        <HeroSlideshow />
        <div className="space-y-3 py-8">
          <TopRatedMovies />
          <TopRatedWebSeries />
          <TopRatedTVSeries />
          <TopRatedDocumentary />
        </div>
      </Container>
    </div>
  );
}
