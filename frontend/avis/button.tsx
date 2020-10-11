import React from 'react';
import styles from './button.scss';

type Props = Pick<React.HTMLProps<HTMLButtonElement>, 'onClick'> & {
	color: string;
	offset: number;
	text: string;
};

export const Button: React.FC<Props> = (props) => (
	<button className={styles.button} onClick={props.onClick}>
		<div className={styles.normal}>
			<svg className={styles.svg} viewBox="-1 -1 52 56">
				<path
					d="M 1 25 L 1 29 A 24 24 0 0 0 49 29 L 49 25"
					fill={props.color}
					stroke={props.color}
					strokeWidth="2"
				/>
				<circle
					cx="25"
					cy="25"
					r="24"
					fill="white"
					stroke={props.color}
					strokeWidth="2"
				/>
			</svg>
			<div
				className={styles.text}
				style={{
					top: `${props.offset}px`,
				}}
			>
				{props.text}
			</div>
		</div>
		<div className={styles.active}>
			<svg className={styles.svg} viewBox="-1 -1 52 56">
				<circle
					cx="25"
					cy="29"
					r="24"
					fill="white"
					stroke={props.color}
					strokeWidth="2"
				/>
			</svg>
			<div
				className={styles.text}
				style={{
					top: `${props.offset + 4}px`,
				}}
			>
				{props.text}
			</div>
		</div>
	</button>
);
