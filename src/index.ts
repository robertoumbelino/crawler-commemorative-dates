import * as Crawler from 'crawler'

import { client } from './db/prisma'

/**
 * Months in portuguese, to be used as parameter in destination page.
 */
const MONTHS = [
  'janeiro',
  'fevereiro',
  'marco',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
]

/**
 * Destination page.
 */
const BASE_URL = 'https://www.guialince.com.br/datas-comemorativas'

/**
 * Crawler instance.
 */
const crawler = new Crawler()

/**
 * Recursively function to get commemorative dates.
 */
const saveCommemorationsFromMonth = async (monthIndex = 0) => {
  /**
   * Get month name.
   */
  const month = MONTHS[monthIndex]

  /**
   * Invalid month, finish it.
   */
  if (!month) {
    console.log('Finished')
    return
  }

  console.log(`Getting commemorative dates from ${month}`)

  try {
    /**
     * URL from destination page.
     */
    const url = `${BASE_URL}/${month}`

    /**
     * Make request.
     */
    crawler.queue({
      url,
      callback: async (error, res, done) => {
        /**
         * Stop process when has an error.
         */
        if (error) {
          console.error('An error occurred', error)
          return
        }

        /**
         * Get jQuery.
         */
        const $ = res.$

        /**
         * Get elements with commemorative dates.
         */
        const elements = $('table.table-hover > tbody > tr').toArray()

        /**
         * Save commemorative dates.
         */
        const promises = elements.map(async line => {
          /**
           * Get data.
           */
          const day = +$(line).find('td:nth-child(1)').text()
          const commemoration = $(line).find('td:nth-child(2)').text()

          /**
           * Payload to save in database.
           */
          const data = { day, month: monthIndex + 1, title: commemoration }

          /**
           * Find to check if already exists.
           */
          const filter = { where: data }
          const foundDate = await client.commemorativeDate.findFirst(filter)

          if (foundDate) {
            console.log('Commemorative date already exists', foundDate)
            return
          }

          /**
           * Create in database.
           */
          const createdDate = await client.commemorativeDate.create({ data })

          console.log('Saved commemorative date', createdDate)
        })

        await Promise.all(promises)

        /**
         * Sleep to don't make many requests in destination page.
         */
        await new Promise(resolve => setTimeout(resolve, 2000))

        await saveCommemorationsFromMonth(monthIndex + 1)

        done()
      }
    })
  } catch ({ message }) {
    console.error(message)
  }
}

/**
 * Start.
 */
saveCommemorationsFromMonth()
