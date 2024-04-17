import { useHistory } from 'react-router-dom';
import Button from 'COMPONENTS/Button';
import Image from 'COMPONENTS/Image';
import { useMediaQuery } from 'hooks/useMediaQuery';
import FormBusdMobileIcon from 'ASSETS/images/pages/home/form-busd-mobile.png';
import FormBusdDesktopIcon from 'ASSETS/images/pages/home/form-busd-desktop.png';
import FormUsdtMobileIcon from 'ASSETS/images/pages/home/form-usdt-mobile.png';
import FormUsdtDesktopIcon from 'ASSETS/images/pages/home/form-usdt-desktop.png';

const LiquidityMiningEvent = () => {
	const history = useHistory();
	const matchMedia_1 = useMediaQuery('(min-width: 768px)');
	const matchMedia_2 = useMediaQuery('(min-width: 960px)');
	const matchMedia_3 = useMediaQuery('(min-width: 1075px)');

	const handleClick = () => history.push('/swap');

	return (
		<div className='liquidity-mining'>
			<div className='liquidity-mining__box'>
				<div className='liquidity-mining__box__col'>
					<Image
						light={
							matchMedia_2
								? FormBusdDesktopIcon
								: FormBusdMobileIcon
						}
						dark={
							matchMedia_2
								? FormBusdDesktopIcon
								: FormBusdMobileIcon
						}
						alt='$FORM - BUSD'
						w='129'
						h='189'
						classes='liquidity-mining__box__col__img'
					/>
					<p className='liquidity-mining__box__col__description txt-glow'>
						&#36;form&#47;
						{!matchMedia_3 && <br />}
						busd
					</p>
				</div>
				<div className='liquidity-mining__box__col'>
					<p className='liquidity-mining__box__txt liquidity-mining__box__txt--1'>
						farming&nbsp;
						{!matchMedia_1 && <br />}
						is live!
					</p>
					<p className='liquidity-mining__box__txt liquidity-mining__box__txt--2 c-white txt-glow'>
						Add&nbsp;
						{!matchMedia_1 && <br />}
						liquidity
					</p>
					<Button
						type='button'
						text='Start here'
						outlinedWhite
						glow
						classes='pl-4 pr-4 liquidity-mining__box__btn'
						onClick={handleClick}
					/>
				</div>
				<div className='liquidity-mining__box__col'>
					<Image
						light={
							matchMedia_2
								? FormUsdtDesktopIcon
								: FormUsdtMobileIcon
						}
						dark={
							matchMedia_2
								? FormUsdtDesktopIcon
								: FormUsdtMobileIcon
						}
						alt='$FORM - USDT'
						w='135'
						h='186'
						classes='liquidity-mining__box__col__img'
					/>
					<p className='liquidity-mining__box__col__description txt-glow'>
						&#36;form&#47;
						{!matchMedia_3 && <br />}
						usdt
					</p>
				</div>
			</div>
		</div>
	);
};

export default LiquidityMiningEvent;
