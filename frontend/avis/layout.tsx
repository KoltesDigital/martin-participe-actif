import React, { useState } from 'react';
import { Visualization } from './visualization';
import styles from './layout.scss';
import { BANDS } from './constants';

export const Layout: React.FC = () => {
	const [votes, setVotes] = useState(BANDS.map(() => 0));

	const increment = (i: number) => {
		const newVotes = votes.slice();
		++newVotes[i];
		setVotes(newVotes);
	};

	const decrement = (i: number) => {
		if (votes[i] > 0) {
			const newVotes = votes.slice();
			--newVotes[i];
			setVotes(newVotes);
		}
	};

	return (
		<div className={styles.fullscreen}>
			<Visualization className={styles.visualization} votes={votes} />
			<div className={styles.overlay}>
				{votes.map((vote, i) => (
					<div key={i} className={styles.voteControl}>
						<button
							className={styles.button}
							onClick={() => decrement(i)}
							style={{
								borderColor: BANDS[i].color,
							}}
						>
							-
						</button>
						<div className={styles.vote}>{vote}</div>
						<button
							className={styles.button}
							onClick={() => increment(i)}
							style={{
								borderColor: BANDS[i].color,
							}}
						>
							+
						</button>
					</div>
				))}
			</div>
		</div>
	);
};
