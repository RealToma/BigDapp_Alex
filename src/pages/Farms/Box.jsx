// import { useState, useContext } from 'react';
import { useCallback, useEffect, useState } from 'react';
// import { ToastContext } from 'CONTEXT/toast-context';
// import Image from 'COMPONENTS/Image';
import Modal from 'COMPONENTS/Modal';
import { useMediaQuery } from 'hooks/useMediaQuery';
import Apy from './components/Apy';
import Coins from './components/Coins';
import CoinsNames from './components/CoinsNames';
import Earn from './components/Earn';
import Caret from './components/Caret';
import SpecialInfo from './components/SpecialInfo';
import ColActionOne from './components/ColActionOne';
import ColActionTwo from './components/ColActionTwo';
import StakeLpModal from './components/StakeLpModal';
import { FARMS_ACTIONS } from './constants';
import { convertToUnit, parseFromUnit, usdFormatter } from 'utils/formatters';
import { useContract } from 'hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import { TRANSACTION_STATUS } from 'UTILS/constants';
import { useContext } from 'react';
import { ToastContext } from 'CONTEXT/toast-context';
import { formatUnits } from '@ethersproject/units';
import { useInterval } from 'hooks/useInterval';
import { CONTRACTS, CONTRACTS_TYPE } from 'utils/contracts';
// import CalculatorDarkIcon from 'ASSETS/images/common/dark/calculator.svg';
// import CalculatorLightIcon from 'ASSETS/images/common/light/calculator.svg';

const Box = ({ 
		formTokenPrice = 0.03,
		box,
		farmType,
		farmName,
		isFarmActive,
	}) => {

	const matchMedia = useMediaQuery('(min-width: 960px)');
	const { notify } = useContext(ToastContext)

	const [isOpened, setIsOpened] = useState(false);
	const [showStakeLpModal, setShowStakeLpModal] = useState(false);
	const [stakeModalType, setStakeModalType] = useState(null);
	const lpFarmingContract = useContract(farmType);
	const formTokenContract = useContract(CONTRACTS_TYPE.FORM_TOKEN);
	const stableTokenContract = useContract(CONTRACTS_TYPE.STABLE_TOKEN);
	const lpTokenContract = useContract(CONTRACTS_TYPE.LP_TOKEN);

	const { account, chainId = 1} = useWeb3React();

	const [pairTvl, setPairTvl] = useState(null);
	const [transactionStatus, setTransactionStatus] = useState({
		status: null,
		type: null,
	});
	const [currentUserAllowance, setCurrentUserAllowance] = useState(false);
	const [currentAPR, setCurrentAPR] = useState(0);
	const [currentMultiplier, setCurrentMultiplier] = useState(0);
	const [totalUserStaked, setTotalUserStaked] = useState(0);
	const [totalUserProfit, setTotalUserProfit] = useState(0);
	const [isEnabled, setIsEnabled] = useState(false);
	const [userTokenBalance, setUserTokenBalance] = useState(null);
	const [showCalculatorModal, setShowCalculatorModal] = useState(false);

	// actions
	const handleHarvesting = async (event) => {
		try {
			event?.stopPropagation();
			const transaction = await lpFarmingContract.withdrawYield();
			notify('info', 'Harvest in progress!', 'Transaction was submitted.');
			setTransactionStatus({ status: TRANSACTION_STATUS.SUBMITTED, type: FARMS_ACTIONS.HARVEST });
			
			await transaction.wait();
			notify('success', 'Harvested!', 'Your FORM earnings have been sent to your wallet.');
			setTransactionStatus({ status: TRANSACTION_STATUS.SUCCESS, type: FARMS_ACTIONS.HARVEST });
		} catch (error) {
			console.log(error);
			notify('error', 'Something is wrong!', 'Please try again later.');
			setTransactionStatus({ status: TRANSACTION_STATUS.FAILED, type: FARMS_ACTIONS.HARVEST });
		}
	};

	const handleUnstaking = async (amount) => {
		try {
			if (lpFarmingContract) {
				const transaction = await lpFarmingContract.unstake(
					convertToUnit(amount?.toFixed(18), 18),
					{ gasLimit: 200000 }
				);
				setTransactionStatus({ status: TRANSACTION_STATUS.SUBMITTED, type: FARMS_ACTIONS.UNSTAKE });
				notify('info', 'Unstaking in progress!', 'Transaction was submitted.');
				
				await transaction.wait();
				setTransactionStatus({ status: TRANSACTION_STATUS.SUCCESS, type: FARMS_ACTIONS.UNSTAKE });
				notify('success', 'Unstaked!', 'Your earnings have been harvested to you wallet.');
			}
		} catch (error) {
			console.log(error);
			setTransactionStatus({ status: TRANSACTION_STATUS.FAILED, type: FARMS_ACTIONS.UNSTAKE });
			notify('error', 'Something is wrong!', 'Please try again later.');
		}
	};

	const handleStaking = async (amount) => {
		try {
			if (currentUserAllowance > 0 && currentUserAllowance > amount) {

				const transaction = await lpFarmingContract.stake(
					convertToUnit(amount?.toFixed(18), 18),
				);
				setTransactionStatus({ status: TRANSACTION_STATUS.SUBMITTED, type: FARMS_ACTIONS.STAKE });
				notify('info', 'Staking in progress!', 'Transaction was submitted.');
				
				await transaction.wait();
				setTransactionStatus({ status: TRANSACTION_STATUS.SUCCESS, type: FARMS_ACTIONS.STAKE });
				notify('success', 'Staked!', 'Your funds have been staked in the farm.');
			}
		} catch (error) {
			console.log(error);
			setTransactionStatus({ status: TRANSACTION_STATUS.FAILED, type: FARMS_ACTIONS.STAKE });
			notify('error', 'Something is wrong!', 'Please try again later.');
		}
	};


	// getters
	const getCurrentUserAllowance = useCallback(async () => {
		if (lpTokenContract) {
			const currentAllowance = await lpTokenContract.allowance(
				account,
				CONTRACTS[farmType][chainId].address
			);
			setCurrentUserAllowance(parseFromUnit(currentAllowance));
		} else {
			setCurrentUserAllowance(0);
		}
	}, [account, chainId, farmType, lpTokenContract]);

	const getFarmTVL = useCallback(async () => {
		if (stableTokenContract && formTokenContract) {
			const formReserve = await formTokenContract.balanceOf(CONTRACTS[CONTRACTS_TYPE.UNISWAP_PAIR][chainId].address);
			const stableReserve = await stableTokenContract.balanceOf(CONTRACTS[CONTRACTS_TYPE.UNISWAP_PAIR][chainId].address);

			const parsedFormReserve = parseFromUnit(formReserve, CONTRACTS[CONTRACTS_TYPE.FORM_TOKEN][chainId].decimals);
			const parsedStableReserve = parseFromUnit(stableReserve, CONTRACTS[CONTRACTS_TYPE.STABLE_TOKEN][chainId].decimals);
			
			const lpTokenTotalSupply = await lpTokenContract.totalSupply();
			const parsedLpTokenSupply = parseFromUnit(lpTokenTotalSupply, 18);
			
			const totalPairValue = parsedFormReserve * formTokenPrice + parsedStableReserve;
			
			const lpTokenOnFarming = await lpTokenContract.balanceOf(CONTRACTS[farmType][chainId].address)
			const parsedLpTokensOnFarming = parseFromUnit(lpTokenOnFarming, 18);

			setPairTvl(parsedLpTokensOnFarming/parsedLpTokenSupply*totalPairValue);
		} else {
			setPairTvl(0);
		}
	}, [chainId, farmType, formTokenContract, formTokenPrice, lpTokenContract, stableTokenContract]);

	const getUserBalance = useCallback(async () => {
		if (account && lpTokenContract) {
			const userBalance = await lpTokenContract.balanceOf(account);
			setUserTokenBalance(userBalance ? formatUnits(userBalance, 18) : 0)
		} else {
			setUserTokenBalance(null);
		}
	}, [account, lpTokenContract]);

	const getCurrentAPY = useCallback(async () => {
		if (lpFarmingContract) {
			const currentAPR = await lpFarmingContract.getAPRValue();
			setCurrentAPR(Number(currentAPR));
		}
	}, [lpFarmingContract]);

	const getCurrentMultiplier = useCallback(async () => {
		if (lpFarmingContract) { 
			const currentMultiplier = await lpFarmingContract.MULTIPLIER();
			setCurrentMultiplier(currentMultiplier ? Number(currentMultiplier / 10) : 0);
		}
	}, [lpFarmingContract]);

	const getTotalStakedAmountOfUser = useCallback(async () => {
		if (account && lpFarmingContract) {
			try {
				const totalProfitPerUser = await lpFarmingContract.getUsersYieldAmount(account).catch(e => 0);				
				const totalStakedPerUser = await lpFarmingContract.stakingBalanceLp(account).catch(e => 0);
				const userProfits = chainId === 1 ? formatUnits(totalProfitPerUser, 6) : formatUnits(totalProfitPerUser, 18)
			
				setTotalUserProfit(totalProfitPerUser ? userProfits : 0);
				setTotalUserStaked(totalStakedPerUser ? formatUnits(totalStakedPerUser, 18) : 0);
			} catch (error) {
				console.log({ error });
				if (
					error?.error?.message ===
					'execution reverted: You do not stake any tokens'
				) {
					console.log('Nothing is staked for that address');
				}
				setTotalUserStaked(0);
			}
		}
	}, [account, lpFarmingContract]);

	const checkIfNeedToIncreaseAllowance = useCallback(() => {
		const result = !currentUserAllowance;
		setIsEnabled(!result);
	}, [currentUserAllowance]);

	// state
	useEffect(() => {
		getTotalStakedAmountOfUser();
		getCurrentAPY();
		getCurrentMultiplier();
		getCurrentUserAllowance();
		getUserBalance();
		checkIfNeedToIncreaseAllowance();
		getFarmTVL();
	}, [
		formTokenContract,
		lpTokenContract,
		lpFarmingContract,
		account,
		chainId,
		transactionStatus,
		getTotalStakedAmountOfUser,
		getCurrentAPY,
		getCurrentMultiplier,
		getCurrentUserAllowance,
		getUserBalance,
		getFarmTVL,
		checkIfNeedToIncreaseAllowance
	]);

	useInterval(() => {
		getTotalStakedAmountOfUser();
		getCurrentAPY();
		getCurrentUserAllowance();
		getUserBalance();
		getFarmTVL();
	}, 5000);

	// input & toggles
	const toggleCalculatorModal = () =>
		setShowCalculatorModal((prevState) => !prevState);


	const toggleOpen = () => {
		if (!isFarmActive) {
			return;
		}
		setIsOpened((prevState) => !prevState);
	}

	const toggleStakeLpModal = (e) => {
		e?.stopPropagation();
		setShowStakeLpModal((prevState) => !prevState);
	};

	const toggleStakeModal = (e) => {
		toggleStakeLpModal(e);
		setStakeModalType(e?.target?.value);
	};

	const totalUserProfitParsed = isFarmActive ? (totalUserProfit / formTokenPrice) : totalUserProfit;
	const totalUserProfitInUsdParsed = isFarmActive ? totalUserProfit : (totalUserProfit * formTokenPrice);

	const mobileView = (
		<>
			<div className='farms__box__header'>
				<Coins box={box} />
				<div className='farms__box__header__info'>
					<CoinsNames box={box} toggleCalculator={() => {}} />
					<Earn isActive={isFarmActive} totalUserProfit={totalUserProfitParsed} />
				</div>
				<Apy currentAPR={currentAPR} />
				<Caret isOpened={isOpened} />
			</div>
			{isOpened && (
				<>
					<SpecialInfo 
						currentMultiplier={currentMultiplier}
						totalStaked={pairTvl}
					/>
					<div className='farms__box__actions'>
						<ColActionOne
							handleHarvesting={handleHarvesting}
							isOpened={isOpened}
							isEnabled={isEnabled}
							totalUserProfit={totalUserProfitParsed}
							totalUserProfitInUSD={totalUserProfitInUsdParsed}
							isTransactionInProgress={transactionStatus.status === TRANSACTION_STATUS.SUBMITTED}
							transactionType={transactionStatus.type}
							isActive={isFarmActive}
						/>
						<ColActionTwo
							isOpened={isOpened}
							isEnabled={isEnabled}
							userTokenBalance={userTokenBalance}
							totalUserStaked={totalUserStaked}
							toggleStakeModal={toggleStakeModal}
							isTransactionInProgress={transactionStatus.status === TRANSACTION_STATUS.SUBMITTED}
							transactionType={transactionStatus.type}
							farmType={farmType}
							isActive={isFarmActive}
						/>
					</div>
				</>
			)}
		</>
	);

	const desktopView = (
		<div className='farms__box__header'>
			<div
				className={`farms__box__header__info ${
					isOpened ? 'farms__box__header__info--opened' : ''
				}`}
			>
				<div
					className={`farms__box__header__info__row ${
						isOpened ? 'farms__box__header__info__row--opened' : ''
					}`}
				>
					<Coins box={box} />
					<CoinsNames box={box} />
					<div style={{ paddingRight: '15px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(var(--common-bg-color-rgb))' }}>
						<p className='font-size-12 txt-center mb-1'>TVL</p>
						<p className='font-size-12 txt-center font-weight-600'>{usdFormatter.format(pairTvl)}</p>
					</div>
					<div className='pl-1 pr-1 d-flex flex-center'>
						<div>
							<p className='font-size-12 txt-center mb-1'>Multiplier</p>
							<p className='font-size-12 txt-center font-weight-600'>{currentMultiplier}x</p>
						</div>
						<Apy currentAPR={currentAPR} />
					</div>
				</div>
				{isOpened ? <div></div> : null}
			</div>

			<div className={`farms__box__actions ${isOpened ? 'farms__box__actions--opened' : ''}`}>
				<ColActionOne
					isDesktop={true}
					isOpened={isOpened}
					isEnabled={isEnabled}
					handleHarvesting={handleHarvesting}
					totalUserProfit={totalUserProfitParsed}
					totalUserProfitInUSD={totalUserProfitInUsdParsed}
					isTransactionInProgress={transactionStatus.status === TRANSACTION_STATUS.SUBMITTED}
					transactionType={transactionStatus.type}
					isActive={isFarmActive}
				/>
				<ColActionTwo
					isDesktop={true}
					isOpened={isOpened}
					isEnabled={isEnabled}
					userTokenBalance={userTokenBalance}
					totalUserStaked={totalUserStaked}
					toggleStakeModal={toggleStakeModal}
					isTransactionInProgress={transactionStatus.status === TRANSACTION_STATUS.SUBMITTED}
					transactionType={transactionStatus.type}
					farmType={farmType}
					isActive={isFarmActive}
				/>
			</div>

			<div
				className={`farms__box__header__info ${
					isOpened ? 'farms__box__header__info--opened' : ''
				}`}
			>
				<div
					className={`farms__box__header__info__last-column ${
						isOpened ? 'farms__box__header__info__last-column--opened' : ''
					}`}
				>
					{
						isFarmActive && (
							<div className='farms__toggler c-pointer flex-1 '>
							<div className='farms__toggler__txt'>
								{/* <button
									type='button'
									className='btn-icon p-0'
									onClick={toggleCalculator}
								>
									<Image
										dark={CalculatorDarkIcon}
										light={CalculatorLightIcon}
										alt='Calculate'
										w='15'
										h='15'
										classes='farms__calculator'
									/>
								</button> */}
								{/* <p className='font-size-12 font-weight-700 line-height-1'>
									{isOpened ? 'hide' : 'info'}
								</p> */}
								<Caret isOpened={isOpened} classes='c-pointer' />
							</div>
						</div>
						)
					}
				</div>
				{isOpened ? <div></div> : null}
			</div>
		</div>
	);

	const renderView = () => (!matchMedia ? mobileView : desktopView);
	const closeStakingModal = () => {
		toggleStakeLpModal();
		setStakeModalType(null);
	}

	return (
		<>
			<div
				className={`farms__box-container ${isOpened ? 'farms__box-container--opened' : ''} ${isFarmActive ? 'farms__box-container--active' : '' } ${!isFarmActive ? 'farms__box-container--disabled' : '' }`}
				onClick={toggleOpen}
			>
				<p className='farms__name'>
					{farmName}
				</p>
				{renderView()}
			</div>
			<Modal show={showStakeLpModal} onCancel={closeStakingModal}>
				<StakeLpModal
					currentPool={box}
					type={stakeModalType}
					formTokenPrice={formTokenPrice}
					onCancel={closeStakingModal}
					userTokenBalance={stakeModalType === FARMS_ACTIONS.STAKE ? userTokenBalance : totalUserStaked}
					handleStaking={handleStaking}
					handleUnstaking={handleUnstaking}
				/>
			</Modal>
		</>
	);
};

export default Box;
