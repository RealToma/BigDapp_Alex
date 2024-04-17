const EarlyAdoptionIcon = ({ color }) => (
	<svg
		width='15'
		height='15'
		viewBox='0 0 15 15'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M1.68598 0.5H14.1304C14.3367 0.5 14.5345 0.581944 14.6804 0.727806C14.8263 0.873667 14.9082 1.0715 14.9082 1.27778V13.7222C14.9082 13.9285 14.8263 14.1263 14.6804 14.2722C14.5345 14.4181 14.3367 14.5 14.1304 14.5H1.68598C1.4797 14.5 1.28187 14.4181 1.13601 14.2722C0.990147 14.1263 0.908203 13.9285 0.908203 13.7222V1.27778C0.908203 1.0715 0.990147 0.873667 1.13601 0.727806C1.28187 0.581944 1.4797 0.5 1.68598 0.5ZM2.46376 2.05556V12.9444H13.3526V2.05556H2.46376Z'
			fill={color || 'white'}
		/>
		<path
			d='M7.90732 9.44446L5.62143 10.8406L6.24287 8.23502L4.20898 6.49279L6.87871 6.27891L7.90732 3.80557L8.93593 6.27891L11.606 6.49279L9.57176 8.23502L10.1932 10.8406L7.90732 9.44446Z'
			fill={color || 'white'}
		/>
	</svg>
);

export default EarlyAdoptionIcon;