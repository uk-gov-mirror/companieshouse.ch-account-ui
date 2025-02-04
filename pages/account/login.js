import PropTypes from 'prop-types'
import React from 'react'
import Router, { useRouter } from 'next/router'
import { findCustomPageProps, forgerockFlow } from '../../services/forgerock'
import HeadingCount from '../../services/HeadingCount'
import { CH_COOKIE_NAME, ID_COOKIE_NAME, FORGEROCK_TREE_LOGIN } from '../../services/environment'
import { getStageFeatures } from '../../services/translate'
import FeatureDynamicView from '../../components/views/FeatureDynamicView'
import withLang from '../../services/lang/withLang'
import { useCookies } from 'react-cookie'
import componentMap from '../../services/componentMap'
import Dynamic from '../../components/Dynamic'

const Login = ({ lang }) => {
  const [, setCookie] = useCookies()
  const router = useRouter()
  const [customPageProps, setCustomPageProps] = React.useState({})
  const [errors, setErrors] = React.useState([])
  const [uiStage, setUiStage] = React.useState('')
  const [uiFeatures, setUiFeatures] = React.useState([])
  const [uiElements, setUiElements] = React.useState([])
  const [submitData, setSubmitData] = React.useState((formData) => {})
  const headingCount = new HeadingCount()

  const { goto } = router.query
  const { notifyType, notifyHeading, notifyTitle, notifyChildren, overrideStage = '' } = router.query

  React.useEffect(() => {
    headingCount.reset()
    forgerockFlow({
      journeyName: FORGEROCK_TREE_LOGIN,
      journeyNamespace: 'LOGIN',
      lang,
      onSuccess: (loginData) => {
        // Set auth cookie
        setCookie(CH_COOKIE_NAME, loginData.tokens.accessToken, { path: '/' })
        setCookie(ID_COOKIE_NAME, loginData.currentUser, { path: '/' })

        if (goto) {
          return Router.push(goto)
        }

        Router.push('/account/home')
      },
      onFailure: (errData, newErrors = []) => {
        setErrors(newErrors)
        setUiFeatures(getStageFeatures(lang, overrideStage || 'LOGIN_1'))
      },
      onUpdateUi: (step, submitDataFunc, stepErrors = []) => {
        const stepCustomPageProps = findCustomPageProps(step)

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
        setUiStage(step.payload.stage)
        setUiFeatures(getStageFeatures(lang, overrideStage || step.payload.stage))
        setUiElements(step.callbacks)
        setSubmitData(() => submitDataFunc)
      }
    })
  }, [goto, overrideStage, notifyType, notifyHeading, notifyTitle, notifyChildren])

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

  return (
    <FeatureDynamicView
      onSubmit={onSubmit}
    >
      <Dynamic
        componentMap={componentMap}
        headingCount={headingCount}
        content={uiFeatures}
        errors={errors}
        uiElements={uiElements}
        uiStage={uiStage}
        {...router.query}
        {...customPageProps}
      />
    </FeatureDynamicView>
  )
}

export default withLang(Login)

Login.propTypes = {
  lang: PropTypes.string
}
