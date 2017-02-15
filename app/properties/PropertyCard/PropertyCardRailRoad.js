import React from 'react'
import className from 'classnames/bind'
import styles from './PropertyCard.css'

const cx = className.bind(styles)

import { Currency } from '../../common'

const splitLast = (str, sep) => {
  const i = str.lastIndexOf(sep)
  return [str.substr(0, i), str.substr(i)]
}

const PropertyCardRailRoad = ({
  name,
  rent,
  mortgage,
  interest,
  isMortgaged,
  simple,
  iconPath
}) => (
  <div className={cx('root', { 'is-simple': simple })}>
    <div className={styles.container}>
      <div className={cx('header', 'has-icon')}>
        <span className={styles['header-icon']}>
          <svg><use xlinkHref={iconPath}/></svg>
        </span>

        {!simple && (
           <span>
             {splitLast(name, ' ').map((piece, i) => (
                <div key={i}>{piece}</div>
              ))}
           </span>
         )}
      </div>

      {!simple && (
         <div className={styles.content}>
           {rent.map((amount, i) => (
              <div key={i} className={styles['rent-line']}>
                <span>{i === 0 ? 'Rent' : `If ${i} are owned`}</span>
                <Currency amount={amount}/>
              </div>
            ))}

           <div className={styles.info}>
             <div>
               <span>Mortgage Value</span>
               <Currency amount={mortgage}/>
             </div>
           </div>
         </div>
       )}
    </div>

    {isMortgaged && (simple ? (
       <div className={styles.overlay}/> 
     ) : (
       <div className={styles.overlay}>
         <span className={styles['overlay-title']}>Mortgaged</span>
         <div className={styles['overlay-text']}>
           <span>Unmortgage for</span>
           <Currency amount={mortgage + interest}/>
         </div>
       </div>
     ))}
  </div>
)

export default PropertyCardRailRoad
