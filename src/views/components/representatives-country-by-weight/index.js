import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import BigNumber from 'bignumber.js'

import {
  getRepresentatives,
  getRepresentativesTotalWeight
} from '@core/accounts'

import RepresentativesCountryByWeight from './representatives-country-by-weight'

const mapStateToProps = createSelector(
  getRepresentatives,
  getRepresentativesTotalWeight,
  (accounts, totalWeight) => {
    const metrics = []
    const countries = {
      unknown: 0
    }

    for (const rep of accounts.valueSeq()) {
      if (!rep.account_meta.weight) continue

      const country = rep.network.country
      if (!country) {
        countries.unknown = BigNumber(rep.account_meta.weight)
          .plus(countries.unknown)
          .toFixed()
        continue
      }

      countries[country] = BigNumber(rep.account_meta.weight)
        .plus(countries[country] || 0)
        .toFixed()
    }

    for (const [country, weight] of Object.entries(countries)) {
      metrics.push({
        label: country,
        value: BigNumber(weight)
          .dividedBy(totalWeight)
          .multipliedBy(100)
          .toFixed(2)
      })
    }

    const filtered = metrics.sort((a, b) => b.value - a.value).slice(0, 6)

    return { metrics: filtered }
  }
)

export default connect(mapStateToProps)(RepresentativesCountryByWeight)
