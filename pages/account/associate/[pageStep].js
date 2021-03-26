import React from 'react'
import HeadingCount from '../../../services/HeadingCount'
import { findCustomPageProps, findCustomStage, forgerockFlow } from '../../../services/forgerock'
import { FORGEROCK_TREE_ASSOCIATE_USER_WITH_COMPANY } from '../../../services/environment'
import Router, { useRouter } from 'next/router'
import { getStageFeatures, translate } from '../../../services/translate'
import UiFeatures from '../../../components/general-ui/UiFeatures'
import FeatureDynamicView from '../../../components/views/FeatureDynamicView'
import withLang from '../../../services/lang/withLang'

export const getStaticPaths = async () => {
  return {
    paths: [
      { params: { pageStep: '_start' } },
      { params: { pageStep: '_restart' } },
      { params: { pageStep: 'verify' } }
    ],
    fallback: false
  }
}

export const getStaticProps = async () => {
  return { props: {} }
}

const AssociateUserAndCompany = ({ lang }) => {
  const router = useRouter()
  const [errors, setErrors] = React.useState([])
  const [customPageProps, setCustomPageProps] = React.useState({})
  const [uiStage, setUiStage] = React.useState('')
  const [uiFeatures, setUiFeatures] = React.useState([])
  const [uiElements, setUiElements] = React.useState([])
  const [submitData, setSubmitData] = React.useState((formData) => {})
  const headingCount = new HeadingCount()

  const { pageStep = '', service = '', token, overrideStage = '' } = router.query
  const { notifyType, notifyHeading, notifyTitle, notifyChildren } = router.query

  let journeyName = ''

  React.useEffect(() => {
    headingCount.reset()
    if (!pageStep) return

    if (pageStep === '_restart') {
      router.replace('/account/associate/_start/')
      return
    }

    if (pageStep === 'verify' && service && token) {
      journeyName = service
    } else {
      journeyName = FORGEROCK_TREE_ASSOCIATE_USER_WITH_COMPANY
    }

    setErrors([])

    const stepOptions = {
      query: {
        token
      }
    }

    console.log('Staring FR journey', journeyName, stepOptions)
    forgerockFlow({
      journeyName,
      journeyNamespace: 'ASSOCIATE_USER_WITH_COMPANY',
      stepOptions,
      onSuccess: (loginData) => {
        Router.push('/account/home')
      },
      onFailure: (err) => {
        const message = translate(lang, 'ERROR_UNKNOWN')
        const reason = err?.payload?.reason || translate(lang, 'ERROR_UNKNOWN')
        const newErrors = []

        switch (reason) {
          case 'Unauthorised':
            newErrors.push({
              label: message,
              anchor: 'IDToken1'
            })
            break

          default:
            newErrors.push({
              label: message,
              anchor: 'IDToken1'
            })
            break
        }

        setErrors(newErrors)

        if (!uiStage) {
          // setUiStage('GENERIC_ERROR')
        }

        setUiFeatures(getStageFeatures(lang, overrideStage || 'ASSOCIATE_USER_WITH_COMPANY_1'))
      },
      onUpdateUi: (step, submitDataFunc, stepErrors = []) => {
        const stepCustomPageProps = findCustomPageProps(step)
        const stage = step.payload.stage || findCustomStage(step)
        step.payload.stage = stage

        if (stepCustomPageProps) {
          if (stepCustomPageProps.apiError) {
            // Transform the apiError structure to the app's errors array structure
            const apiErrorsAsAppErrors = stepCustomPageProps.apiError.errors.map((errorItem) => ({
              label: errorItem.message
            }))

            stepErrors.push(...apiErrorsAsAppErrors)
          }
        }

        // Update the errors for the page
        setErrors((currentErrorsArray) => {
          return [...currentErrorsArray, ...stepErrors]
        })

        setCustomPageProps(stepCustomPageProps)
        setUiStage(stage)
        setUiFeatures(getStageFeatures(lang, overrideStage || stage))
        setUiElements(step.callbacks)
        setSubmitData(() => submitDataFunc)
      }
    })
  }, [pageStep, overrideStage, service, token])

  const onSubmit = (evt) => {
    evt.preventDefault()
    setErrors([])

    // Convert UI element values to JSON key/value pairs
    const formData = Object.entries(evt.target.elements).reduce((obj, [key, element]) => {
      obj[key] = element.value
      return obj
    }, {})

    submitData(formData)
  }

  const renderFeatures = (props) => {
    return <UiFeatures {...props} />
  }

  // Check if the router has been initialised yet
  if (!pageStep) return null

  return (
    <FeatureDynamicView
      renderFeatures={renderFeatures}
      onSubmit={onSubmit}
      errors={errors}
      headingCount={headingCount}
      uiFeatures={uiFeatures}
      uiElements={uiElements}
      uiStage={uiStage}
      notifyType={notifyType}
      notifyHeading={notifyHeading}
      notifyTitle={notifyTitle}
      notifyChildren={notifyChildren}
      {...customPageProps}
    />
  )
}

export default withLang(AssociateUserAndCompany)
