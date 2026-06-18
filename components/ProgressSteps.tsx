import { StyleSheet, Text, View } from 'react-native';

type Props = {
  currentStep: 1 | 2 | 3 | 4;
};

const steps = [
  { number: 1, label: 'Create' },
  { number: 2, label: 'Shooter' },
  { number: 3, label: 'Goalkeeper' },
  { number: 4, label: 'Results' },
];

export default function ProgressSteps({ currentStep }: Props) {
  return (
    <View style={styles.wrapper}>
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <View key={step.number} style={styles.stepGroup}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isActive && styles.activeCircle,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  (isCompleted || isActive) && styles.activeCircleText,
                ]}
              >
                {step.number}
              </Text>
            </View>

            <Text
              style={[
                styles.label,
                (isCompleted || isActive) && styles.activeLabel,
              ]}
            >
              {step.label}
            </Text>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  step.number < currentStep && styles.completedLine,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    backgroundColor: '#111827',
  },
  completedCircle: {
    backgroundColor: '#111827',
  },
  circleText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 13,
  },
  activeCircleText: {
    color: '#FFFFFF',
  },
  label: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#111827',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  completedLine: {
    backgroundColor: '#111827',
  },
});