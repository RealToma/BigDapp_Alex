import { useHistory } from 'react-router-dom';
import Button from 'COMPONENTS/Button';

const Simple = () => {
	const history = useHistory();

	const handleClick = () => history.push('/pools');

	return (
		<div className='home__simple space-h--mobile'>
			<div className='home__simple__box'>
				<div className='home__simple__box__txt'>
					<span className='txt-marked txt-marked--dark c-white'>
						single
					</span>
					<br />
					<p className='c-dark mb-1'>sided staking</p>
					<p className='c-dark'>stake &#36;form</p>
					<p className='c-dark'>&#47;earn &#36;form</p>
				</div>
				<Button
					type='button'
					text='Stake now'
					outlinedDark
					classes='pl-4 pr-4 mt-3'
					onClick={handleClick}
				/>
			</div>
		</div>
	);
};

export default Simple;
