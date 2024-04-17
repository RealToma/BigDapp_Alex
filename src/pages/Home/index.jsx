import { useContext } from 'react';
import { ThemeContext } from 'CONTEXT/theme-context';
import Header from './components/Header';
import NewFeature from './components/NewFeature';
import V1Alhpa from './components/V1Alpha';
import Simple from './components/Simple';
import LiquidityMiningEvent from './components/LiquidityMiningEvent';
import Title from 'COMPONENTS/Title';
import { useMediaQuery } from 'hooks/useMediaQuery';

const Home = () => {
	const { theme } = useContext(ThemeContext);
	const matchMedia = useMediaQuery('(min-width: 960px)');

	const renderTitleStyle = () =>
		theme === 'theme-dark' ? 'c-white' : matchMedia ? 'c-dark' : 'c-white';

	return (
		<div className='home'>
			{matchMedia && (
				<Title
					title='Home'
					classes={renderTitleStyle() + ' title__home'}
				/>
			)}
			<Header />
			<LiquidityMiningEvent />
			<p className='space-h--mobile mt-2'>News&#47; Lately update</p>
			<div className='home__content'>
				<Simple />
				<V1Alhpa />
			</div>
			<NewFeature />
		</div>
	);
};

export default Home;
