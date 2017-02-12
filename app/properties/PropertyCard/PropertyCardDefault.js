import React from 'react'
import className from 'classnames/bind'
import styles from './PropertyCard.css'

const cx = className.bind(styles)

import { Currency } from '../../common'

const PropertyCardDefault = ({
  name,
  rent,
  cost,
  color,
  mortgageValue,
  mortgageCost,
  isMortgaged,
  simple
}) => (
  <div className={cx('root', { 'is-simple': simple })}>
    <div className={styles.container}>
      <div className={styles.header} style={{ backgroundColor: color }}>
        {!simple && <span>{name}</span>}
      </div>

      {!simple && (
         <div className={styles.content}>
           {rent.map((amount, i) => (
              (i === 0 ? (
                <div key={i} className={styles.rent}>
                  <span>Rent</span>
                  <Currency amount={amount}/>
                </div>
              ) : i < 5 ? (
                <div key={i} className={styles['rent-line']}>
                  <span>Rent with {i} House{i > 1 && 's'}</span>
                  <Currency amount={amount}/>
                </div>
              ) : (
                <div key={i} className={styles.rent}>
                  <span>With Hotel</span>
                  <Currency amount={amount}/>
                </div>
              ))
            ))}

           <div className={styles.info}>
             <div>
               <span>Mortgage Value</span>
               <Currency amount={mortgageValue}/>
             </div>

             <div>
               <span>Houses cost</span>
               <Currency amount={cost}/>
               <span>each</span>
             </div>

             <div>
               <span>Hotels,</span>
               <Currency amount={cost}/>
               <span>plus 4 houses</span>
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
           <Currency amount={mortgageCost}/>
         </div>
       </div>
     ))}
  </div>
)

export default PropertyCardDefault
