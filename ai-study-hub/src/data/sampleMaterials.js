/**
 * MindSpark AI - Initial Sample Study Materials
 */

export const SAMPLE_MATERIALS = [
  {
    id: 'mat-1',
    title: 'Quantum Computing & Qubits',
    category: 'Computer Science',
    icon: 'Atom',
    difficulty: 'Advanced',
    lastActive: 'Just now',
    content: `# Introduction to Quantum Computing & Superposition

Quantum computing leverages the fundamental principles of quantum mechanics to process information in ways exponentially faster than classical supercomputers.

## 1. Classical Bits vs. Qubits
- **Classical Bit**: The fundamental unit of classical information, representing either a binary state of 0 or 1.
- **Qubit (Quantum Bit)**: Can exist in a state of 0, 1, or a linear superposition of both simultaneously until measured.
- Mathematical representation of a qubit state $|\psi\rangle$:
  $$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$
  where $\alpha$ and $\beta$ are complex probability amplitudes satisfying $|\alpha|^2 + |\beta|^2 = 1$.

## 2. Quantum Superposition & Measurement
Superposition allows a system of $n$ qubits to simultaneously represent $2^n$ computational states. Upon measurement, the wave function collapses into a single deterministic classical state according to the Born Rule:
- Probability of measuring state $|0\rangle$: $P(0) = |\alpha|^2$
- Probability of measuring state $|1\rangle$: $P(1) = |\beta|^2$

## 3. Quantum Entanglement
Quantum entanglement occurs when pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently of the state of the others.
- **Bell State Equation**:
  $$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$
Measuring the state of one entangled qubit instantaneously dictates the measured outcome of its pair, regardless of the distance separating them.

## 4. Key Algorithms & Applications
- **Shor's Algorithm**: Factors large integers in polynomial time $O((\log N)^3)$, threatening classical RSA encryption.
- **Grover's Search Algorithm**: Provides quadratic speedup $O(\sqrt{N})$ for unstructured database search.
- **Quantum Chemistry & Drug Discovery**: Simulating molecular structures and chemical reaction dynamics at the quantum level.`
  },
  {
    id: 'mat-2',
    title: 'Cellular Respiration & ATP Synthesis',
    category: 'Biology',
    icon: 'Dna',
    difficulty: 'Intermediate',
    lastActive: '2 hours ago',
    content: `# Cellular Respiration and Energy Harvesting

Cellular respiration is the metabolic process by which cells convert biochemical energy from nutrients into Adenosine Triphosphate (ATP) and release waste products.

## 1. Overall Chemical Reaction
The net equation for aerobic glucose catabolism is:
$$C_6H_{12}O_6 + 6O_2 \rightarrow 6CO_2 + 6H_2O + \sim 30\text{--}32\text{ ATP}$$

## 2. The Four Stages of Respiration
1. **Glycolysis** (Cytosol):
   - Breakdown of 1 molecule of glucose ($6C$) into 2 molecules of pyruvate ($3C$).
   - Yields net $2\text{ ATP}$ and $2\text{ NADH}$.
   - Occurs under both aerobic and anaerobic conditions.

2. **Pyruvate Oxidation** (Mitochondrial Matrix):
   - Pyruvate is converted into Acetyl-CoA, releasing $CO_2$ and generating $NADH$.

3. **Citric Acid (Krebs) Cycle** (Mitochondrial Matrix):
   - Acetyl-CoA combines with oxaloacetate to form citrate.
   - Per turn of the cycle: generates $3\text{ NADH}$, $1\text{ FADH}_2$, $1\text{ GTP/ATP}$, and $2\text{ CO}_2$.

4. **Oxidative Phosphorylation & Chemiosmosis** (Inner Mitochondrial Membrane):
   - **Electron Transport Chain (ETC)**: High-energy electrons from $NADH$ and $FADH_2$ pass through protein complexes (I to IV), pumping $H^+$ ions into the intermembrane space to establish a proton-motive gradient.
   - **ATP Synthase**: $H^+$ ions flow back into the matrix through ATP Synthase, driving the rotational synthesis of ATP:
     $$ADP + P_i + H^+_{\text{out}} \rightarrow ATP + H^+_{\text{in}}$$

## 3. Anaerobic Respiration & Fermentation
In the absence of oxygen ($O_2$), cells regenerate $NAD^+$ via fermentation to keep glycolysis functioning:
- **Lactic Acid Fermentation** (Human Muscle Cells): Pyruvate $\rightarrow$ Lactate.
- **Alcohol Fermentation** (Yeast): Pyruvate $\rightarrow$ Ethanol $+ CO_2$.`
  },
  {
    id: 'mat-3',
    title: 'Deep Neural Networks & Backpropagation',
    category: 'Artificial Intelligence',
    icon: 'Cpu',
    difficulty: 'Advanced',
    lastActive: '1 day ago',
    content: `# Deep Learning Foundations: Neural Networks & Backpropagation

Artificial Neural Networks (ANNs) are computational models inspired by biological neural networks used to learn complex non-linear mappings from data.

## 1. Single Perceptron & Activation
A single artificial neuron computes a weighted sum of inputs plus a bias, passed through an activation function $\sigma$:
$$z = \sum_{i=1}^{n} w_i x_i + b = \mathbf{w}^T \mathbf{x} + b$$
$$\hat{y} = \sigma(z)$$

Common Activation Functions:
- **Sigmoid**: $\sigma(z) = \frac{1}{1 + e^{-z}}$
- **ReLU (Rectified Linear Unit)**: $\text{ReLU}(z) = \max(0, z)$
- **Softmax** (Multiclass Output): $P(y = c | \mathbf{x}) = \frac{e^{z_c}}{\sum_{k} e^{z_k}}$

## 2. Loss Functions
- **Mean Squared Error (MSE)** for Regression:
  $$\mathcal{L}_{MSE} = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2$$
- **Binary Cross-Entropy (BCE)** for Classification:
  $$\mathcal{L}_{BCE} = -[y \log(\hat{y}) + (1 - y) \log(1 - \hat{y})]$$

## 3. Backpropagation & The Chain Rule
Backpropagation calculates the gradient of the loss function with respect to every weight parameter in the network using the calculus chain rule.

For a weight $w_{ij}^{(l)}$ connecting layer $l-1$ to layer $l$:
$$\frac{\partial \mathcal{L}}{\partial w_{ij}^{(l)}} = \frac{\partial \mathcal{L}}{\partial z_j^{(l)}} \cdot \frac{\partial z_j^{(l)}}{\partial w_{ij}^{(l)}} = \delta_j^{(l)} a_i^{(l-1)}$$

Where the error term $\delta_j^{(l)}$ is propagated backwards from layer $l+1$:
$$\delta_j^{(l)} = \left( \sum_{k} \delta_k^{(l+1)} w_{jk}^{(l+1)} \right) \cdot \sigma'(z_j^{(l)})$$

## 4. Optimization: Gradient Descent
Parameters are updated iteratively against the loss gradient using learning rate $\eta$:
$$w \leftarrow w - \eta \frac{\partial \mathcal{L}}{\partial w}$$

Modern variants include **Adam (Adaptive Moment Estimation)**, which combines momentum and RMSProp.`
  }
];
