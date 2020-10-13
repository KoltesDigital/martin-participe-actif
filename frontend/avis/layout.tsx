import React, { useState } from 'react';
import { Button } from './button';
import { BAND_INFOS } from './constants';
import styles from './layout.scss';
import { Visualization } from './visualization';

export const Layout: React.FC = () => {
	const [votes, setVotes] = useState(BAND_INFOS.map(() => 0));

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

	const votesSum = votes.reduce((sum, vote) => sum + vote, 0);

	return (
		<div className={styles.fullscreen}>
			<Visualization className={styles.visualization} votes={votes} />
			<div className={styles.controlPanel}>
				{votes.map((vote, i) => (
					<div key={i} className={styles.voteControl}>
						<Button
							color={BAND_INFOS[i].color}
							offset={-3}
							onClick={() => decrement(i)}
							text="-"
						/>
						<div
							className={styles.vote}
							onDoubleClick={() => {
								const value = prompt(BAND_INFOS[i].name, vote.toString());
								if (typeof value === 'string') {
									const newVote = parseInt(value);
									if (!isNaN(newVote)) {
										const newVotes = votes.slice();
										newVotes[i] = newVote;
										setVotes(newVotes);
									}
								}
							}}
						>
							{vote}
						</div>
						<Button
							color={BAND_INFOS[i].color}
							offset={2}
							onClick={() => increment(i)}
							text="+"
						/>
					</div>
				))}
			</div>
			<div className={styles.votesSum}>
				<div>
					{votesSum} opinion{votesSum > 1 && 's'}
				</div>
			</div>
		</div>
	);
};
