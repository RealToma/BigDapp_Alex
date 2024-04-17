import { useContext } from 'react';
import { ThemeContext } from 'CONTEXT/theme-context';
import { useMediaQuery } from 'hooks/useMediaQuery';

const NewFeature = () => {
	const matchMedia = useMediaQuery('(min-width: 768px)');
	const { theme } = useContext(ThemeContext);

	const renderTextClasses = () =>
		`txt-marked ${
			theme === 'theme-light'
				? 'txt-marked--dark c-white'
				: 'txt-marked--green c-dark'
		}`;

	return (
		<div className='new-feature space-h--mobile'>
			<div className='new-feature__box'>
				<p className='new-feature__box__txt'>
					<span>
						usdt&#47;busd pool&nbsp;
						<br />
						<span className={renderTextClasses()}>
							add liquidity,&nbsp;
						</span>
						{!matchMedia && <br />}
						<span className={renderTextClasses()}>earn fees</span>
					</span>
					<br />
					<span className={renderTextClasses()}>
						&#38; collect $form
					</span>
				</p>
				<p className='font-size-14 font-weight-800 txt-uppercase txt-italic mt-2'>
					available soon
				</p>
			</div>
		</div>
	);
};

export default NewFeature;
