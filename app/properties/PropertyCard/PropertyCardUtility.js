import React from 'react'
import className from 'classnames/bind'
import styles from './PropertyCard.css'

const cx = className.bind(styles)

import { Currency } from '../../common'

const PropertyCardUtility = ({ name, rent, mortgage, simple, iconPath }) => (
  <div className={cx('root', { 'is-simple': simple })}>
    <div className={styles.container}>
      <div className={cx('header', 'has-icon')}>
        <span className={styles['header-icon']}>
          <svg><use xlinkHref={iconPath}/></svg>
        </span>

        {!simple && <span>{name}</span>}
      </div>

      {!simple && (
         <div className={styles.content}>
           <div className={styles.info}>
             <div>If one Utility is owned,</div>
             <div>rent is {rent[0]} times amount</div>
             <div>shown on dice.</div>
           </div>

           <div className={styles.info}>
             <div>If both Utilities are owned,</div>
             <div>rent is {rent[1]} times amount</div>
             <div>shown on dice.</div>
           </div>

           <div className={styles.info}>
             <div>
               <span>Mortgage Value</span>
               <span><Currency amount={mortgage}/></span>
             </div>
           </div>
         </div>
       )}
    </div>
  </div>
)

export default PropertyCardUtility
