import HeadingCount from '../../services/HeadingCount'

const FmpRequest = () => {
  const headingCount = new HeadingCount()

  React.useEffect(() => {
    headingCount.reset()
  })
  return null
}

export default FmpRequest
